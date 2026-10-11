import { PostStatus, Prisma } from '@prisma/client';

/**
 * The live posts a caller may read on the site: PUBLISHED for everyone, plus
 * PRIVATE for the admin. Drafts and soft-deleted posts are never part of it.
 * Every public list and every count (tags, collections) goes through this, so a
 * private post cannot leak through a number.
 */
export function readablePosts(isAdmin: boolean): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    status: isAdmin
      ? { in: [PostStatus.PUBLISHED, PostStatus.PRIVATE] }
      : PostStatus.PUBLISHED,
  };
}
