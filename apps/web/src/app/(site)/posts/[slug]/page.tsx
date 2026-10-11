import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { Comments } from '@/components/comments';
import { Markdown } from '@/components/markdown';
import { TagBadge } from '@/components/tag-badge';

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ comment?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post not found' };
  return { title: post.title, description: post.excerpt ?? undefined };
}

export default async function PostPage({ params, searchParams }: Params) {
  const [{ slug: rawSlug }, { comment }] = await Promise.all([
    params,
    searchParams,
  ]);
  const slug = decodeURIComponent(rawSlug);
  const post = await getPostBySlug(slug);
  if (!post || post.status !== 'PUBLISHED') notFound();
  const flash =
    comment === 'ok' ? 'ok' : comment === 'error' ? 'error' : undefined;
  const authed = await isAuthed();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted hover:underline underline-offset-4"
        >
          ← Back to list
        </Link>
        {authed ? (
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="text-sm text-muted hover:underline underline-offset-4"
          >
            Edit →
          </Link>
        ) : null}
      </div>

      <article className="mt-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted">
            <time dateTime={post.publishedAt ?? undefined}>
              {formatDate(post.publishedAt)}
            </time>
            {post.readingTime ? <span>· {post.readingTime} min</span> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {post.title}
          </h1>
          {post.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          ) : null}
        </header>

        <Markdown>{post.content}</Markdown>
      </article>

      <Comments
        postId={post.id}
        slug={post.slug}
        comments={post.comments ?? []}
        flash={flash}
      />
    </main>
  );
}
