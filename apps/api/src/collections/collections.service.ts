import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../common/slug.util';
import { LISTED_POSTS, lockPrivate } from '../posts/post-visibility';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from '../tags/tags.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

// The author-defined order; creation time breaks a tie.
const IN_ORDER: Prisma.CollectionOrderByWithRelationInput[] = [
  { position: 'asc' },
  { createdAt: 'asc' },
];

// A collection's rule tags always come back in name order.
const RULES = { tags: { orderBy: { name: 'asc' } } } as const;

type WithRules = Prisma.CollectionGetPayload<{ include: typeof RULES }>;

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tags: TagsService,
  ) {}

  // The posts a collection shows: the ones listed on the site (published and
  // private) that carry every rule tag. No rules means no extra condition.
  private matching(rules: { id: string }[]): Prisma.PostWhereInput {
    return {
      ...LISTED_POSTS,
      AND: rules.map((tag) => ({ tags: { some: { id: tag.id } } })),
    };
  }

  private async withCount(collection: WithRules) {
    const postCount = await this.prisma.post.count({
      where: this.matching(collection.tags),
    });
    return { ...collection, postCount };
  }

  async create(dto: CreateCollectionDto) {
    try {
      // A new collection goes last.
      const last = await this.prisma.collection.aggregate({
        _max: { position: true },
      });
      const created = await this.prisma.collection.create({
        data: {
          title: dto.title,
          slug: slugify(dto.title) || 'collection',
          description: dto.description,
          position: (last._max.position ?? -1) + 1,
          ...(dto.rules?.length && {
            tags: { connect: await this.tags.resolve(dto.rules) },
          }),
        },
        include: RULES,
      });
      return await this.withCount(created);
    } catch (err) {
      this.rethrow(err);
    }
  }

  async findAll() {
    const collections = await this.prisma.collection.findMany({
      orderBy: IN_ORDER,
      include: RULES,
    });
    return Promise.all(collections.map((c) => this.withCount(c)));
  }

  // Put the collections in the given order. Any collection left out of `ids`
  // keeps its relative order after the listed ones; every position is rewritten
  // in one transaction so the order is never half-applied.
  async reorder(ids: string[]) {
    const current = await this.prisma.collection.findMany({
      orderBy: IN_ORDER,
      select: { id: true },
    });
    const known = new Set(current.map((c) => c.id));
    const unknown = ids.find((id) => !known.has(id));
    if (unknown) {
      throw new NotFoundException(`Collection not found: ${unknown}`);
    }
    const listed = new Set(ids);
    const order = [
      ...ids,
      ...current.map((c) => c.id).filter((id) => !listed.has(id)),
    ];
    await this.prisma.$transaction(
      order.map((id, position) =>
        this.prisma.collection.update({ where: { id }, data: { position } }),
      ),
    );
    return this.findAll();
  }

  /**
   * A collection with the listed posts that satisfy its rules, newest first. A
   * non-admin gets each private post's header only.
   */
  async findOne(idOrSlug: string, isAdmin = false) {
    const collection = await this.prisma.collection.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: RULES,
    });
    if (!collection) {
      throw new NotFoundException(`Collection not found: ${idOrSlug}`);
    }
    const posts = await this.prisma.post.findMany({
      where: this.matching(collection.tags),
      include: { tags: { orderBy: { name: 'asc' } } },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
    return {
      ...collection,
      postCount: posts.length,
      posts: posts.map((post) => lockPrivate(post, isAdmin)),
    };
  }

  async update(id: string, dto: UpdateCollectionDto) {
    try {
      const updated = await this.prisma.collection.update({
        where: { id },
        data: {
          // The slug follows the title.
          ...(dto.title !== undefined && {
            title: dto.title,
            slug: slugify(dto.title) || 'collection',
          }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.rules !== undefined && {
            tags: { set: await this.tags.resolve(dto.rules) },
          }),
        },
        include: RULES,
      });
      return await this.withCount(updated);
    } catch (err) {
      this.rethrow(err, id);
    }
  }

  async remove(id: string) {
    try {
      // implicit M:N: the rule rows are removed automatically; tags are untouched
      await this.prisma.collection.delete({ where: { id } });
    } catch (err) {
      this.rethrow(err, id);
    }
  }

  private rethrow(err: unknown, id?: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new ConflictException(
          'A collection with this title already exists',
        );
      }
      if (err.code === 'P2025') {
        throw new NotFoundException(`Collection not found: ${id}`);
      }
    }
    throw err;
  }
}
