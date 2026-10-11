import { PostStatus, Prisma } from '@prisma/client';

/**
 * The live posts shown on the site: PUBLISHED and PRIVATE, never drafts or
 * soft-deleted posts. Every public list and every count (tags, collections) goes
 * through this. A private post is listed for everyone — only its body is
 * withheld, see lockPrivate().
 */
export const LISTED_POSTS: Prisma.PostWhereInput = {
  deletedAt: null,
  status: { in: [PostStatus.PUBLISHED, PostStatus.PRIVATE] },
};

/**
 * A private post as a non-admin may receive it: the header only. The body,
 * excerpt and comments are removed here, on the server, so they never reach a
 * reader. Published posts and admin reads pass through untouched.
 */
export function lockPrivate<
  T extends { status: PostStatus; content: string; excerpt: string | null },
>(post: T, isAdmin: boolean): T {
  if (isAdmin || post.status !== PostStatus.PRIVATE) return post;
  return {
    ...post,
    content: '',
    excerpt: null,
    ...('comments' in post && { comments: [] }),
  };
}
