import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { Comments } from '@/components/comments';
import { Markdown } from '@/components/markdown';
import { HomeLink, PageShell } from '@/components/page';
import { PostMeta } from '@/components/post-meta';
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
  // A draft has no page for anyone. A private post has one for everyone, but the
  // API sends its body to the signed-in author only.
  if (!post || post.status === 'DRAFT') notFound();
  const flash =
    comment === 'ok' ? 'ok' : comment === 'error' ? 'error' : undefined;
  const authed = await isAuthed();

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <HomeLink />
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
          <PostMeta post={post} />
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

        {post.status === 'PRIVATE' && !authed ? (
          <p className="text-muted">This post is private.</p>
        ) : (
          <Markdown>{post.content}</Markdown>
        )}
      </article>

      {/* Comments are for published posts only. */}
      {post.status === 'PUBLISHED' ? (
        <Comments
          postId={post.id}
          slug={post.slug}
          comments={post.comments ?? []}
          flash={flash}
        />
      ) : null}
    </PageShell>
  );
}
