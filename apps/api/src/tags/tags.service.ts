import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../common/slug.util';
import { LISTED_POSTS } from '../posts/post-visibility';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  // Turn tag names into tag ids: each name is matched to an existing tag by slug
  // or by name (case-insensitive), and only an unmatched name creates a tag.
  // Blank and repeated names are dropped.
  async resolve(names: string[]): Promise<{ id: string }[]> {
    const ids = new Set<string>();
    for (const raw of names) {
      const name = raw.trim();
      const slug = slugify(name);
      if (!slug) continue;
      const tag =
        (await this.prisma.tag.findFirst({
          where: {
            OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }],
          },
          select: { id: true },
        })) ??
        (await this.prisma.tag.create({
          data: { name, slug },
          select: { id: true },
        }));
      ids.add(tag.id);
    }
    return [...ids].map((id) => ({ id }));
  }

  async create(dto: CreateTagDto) {
    try {
      return await this.prisma.tag.create({
        data: {
          name: dto.name,
          slug: dto.slug ? slugify(dto.slug) : slugify(dto.name),
          description: dto.description,
        },
      });
    } catch (err) {
      this.rethrow(err);
    }
  }

  // Counts cover the posts shown on the site (published and private), never
  // drafts. Ordered by that count, highest first, then by name.
  async findAll() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { posts: { where: LISTED_POSTS } } },
      },
    });
    return tags.sort((a, b) => b._count.posts - a._count.posts);
  }

  async findOne(idOrSlug: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        _count: { select: { posts: { where: LISTED_POSTS } } },
      },
    });
    if (!tag) throw new NotFoundException(`Tag not found: ${idOrSlug}`);
    return tag;
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.ensureExists(id);
    try {
      return await this.prisma.tag.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: slugify(dto.slug) }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.home !== undefined && {
            homePosition: await this.homePositionFor(tag, dto.home),
          }),
        },
      });
    } catch (err) {
      this.rethrow(err, id);
    }
  }

  // A tag newly shown on the home page goes last; one already there keeps its place.
  private async homePositionFor(
    tag: { homePosition: number | null },
    home: boolean,
  ): Promise<number | null> {
    if (!home) return null;
    if (tag.homePosition !== null) return tag.homePosition;
    const last = await this.prisma.tag.aggregate({
      _max: { homePosition: true },
    });
    return (last._max.homePosition ?? -1) + 1;
  }

  // Put the home page's tags in the given order. A home tag left out of `ids`
  // keeps its relative order after the listed ones; every position is rewritten
  // in one transaction so the order is never half-applied.
  async reorderHome(ids: string[]) {
    const current = await this.prisma.tag.findMany({
      where: { homePosition: { not: null } },
      orderBy: [{ homePosition: 'asc' }, { name: 'asc' }],
      select: { id: true },
    });
    const known = new Set(current.map((tag) => tag.id));
    const unknown = ids.find((id) => !known.has(id));
    if (unknown) {
      throw new NotFoundException(`Tag not on the home page: ${unknown}`);
    }
    const listed = new Set(ids);
    const order = [
      ...ids,
      ...current.map((tag) => tag.id).filter((id) => !listed.has(id)),
    ];
    await this.prisma.$transaction(
      order.map((id, homePosition) =>
        this.prisma.tag.update({ where: { id }, data: { homePosition } }),
      ),
    );
    return this.findAll();
  }

  async remove(id: string) {
    try {
      // implicit M:N: join rows to posts are removed automatically
      await this.prisma.tag.delete({ where: { id } });
    } catch (err) {
      this.rethrow(err, id);
    }
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.tag.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Tag not found: ${id}`);
    return found;
  }

  private rethrow(err: unknown, id?: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new ConflictException('A tag with this slug already exists');
      }
      if (err.code === 'P2025') {
        throw new NotFoundException(`Tag not found: ${id}`);
      }
    }
    throw err;
  }
}
