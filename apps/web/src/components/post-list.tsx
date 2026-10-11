import Link from 'next/link';
import type { Post } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { TagBadge } from '@/components/tag-badge';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-muted">No posts published yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-10">
      {posts.map((post) => (
        <li key={post.id}>
          <article>
            <div className="flex items-center gap-2 text-xs text-muted">
              <time dateTime={post.publishedAt ?? undefined}>
                {formatDate(post.publishedAt)}
              </time>
              {post.readingTime ? <span>· {post.readingTime} min</span> : null}
            </div>

            <h2 className="mt-2 text-xl font-semibold">
              <Link
                href={`/posts/${post.slug}`}
                className="hover:underline underline-offset-4"
              >
                {post.title}
              </Link>
            </h2>

            {post.excerpt ? (
              <p className="mt-1 line-clamp-2 text-muted">{post.excerpt}</p>
            ) : null}

            {post.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  );
}
