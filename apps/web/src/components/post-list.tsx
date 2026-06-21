import Link from 'next/link';
import type { Post } from '@/lib/api';
import { formatDate } from '@/lib/format';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-zinc-500">아직 발행된 글이 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col gap-10">
      {posts.map((post) => (
        <li key={post.id}>
          <article>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Link
                href={`/categories/${post.category.slug}`}
                className="rounded-full bg-zinc-100 px-2 py-0.5 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                {post.category.name}
              </Link>
              <time dateTime={post.publishedAt ?? undefined}>
                {formatDate(post.publishedAt)}
              </time>
              {post.readingTime ? <span>· {post.readingTime}분</span> : null}
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
              <p className="mt-1 line-clamp-2 text-zinc-600 dark:text-zinc-400">
                {post.excerpt}
              </p>
            ) : null}

            {post.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  );
}
