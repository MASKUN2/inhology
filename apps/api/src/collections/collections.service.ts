import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostStatus, Prisma } from '@prisma/client';
import { slugify } from '../common/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from '../tags/tags.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

// A collection's rule tags always come back in name order.
const RULES = { tags: { orderBy: { name: 'asc' } } } as const;

type WithRules = Prisma.CollectionGetPayload<{ include: typeof RULES }>;

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tags: TagsService,
  ) {}

  // The posts a collection shows: published, not deleted, and carrying every rule
  // tag. No rules means no extra condition, i.e. every published post.
  private matching(rules: { id: string }[]): Prisma.PostWhereInput {
    return {
      status: PostStatus.PUBLISHED,
      deletedAt: null,
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
      const created = await this.prisma.collection.create({
        data: {
          title: dto.title,
          slug: slugify(dto.title) || 'collection',
          description: dto.description,
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
      orderBy: { createdAt: 'asc' },
      include: RULES,
    });
    return Promise.all(collections.map((c) => this.withCount(c)));
  }

  /** A collection with the published posts that satisfy its rules, newest first. */
  async findOne(idOrSlug: string) {
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
    return { ...collection, postCount: posts.length, posts };
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
