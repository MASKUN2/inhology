import type { Post } from '@/lib/api';
import { formatDate } from '@/lib/format';

/**
 * The line above a post's title: publication date and reading time, led by a
 * badge when the post is private (listed for everyone, readable by the
 * signed-in author only).
 */
export function PostMeta({ post }: { post: Post }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      {post.status === 'PRIVATE' ? (
        <span className="whitespace-nowrap rounded-full border border-border px-2 py-0.5 text-xs text-muted">
          Private
        </span>
      ) : null}
      <time dateTime={post.publishedAt ?? undefined}>
        {formatDate(post.publishedAt)}
      </time>
      {post.readingTime ? <span>· {post.readingTime} min</span> : null}
    </div>
  );
}
