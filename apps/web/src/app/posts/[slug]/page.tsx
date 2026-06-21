import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '@/lib/api';
import { formatDate } from '@/lib/format';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: '글을 찾을 수 없습니다' };
  return { title: post.title, description: post.excerpt ?? undefined };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== 'PUBLISHED') notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:underline underline-offset-4"
      >
        ← 목록으로
      </Link>

      <article className="mt-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              {post.category.name}
            </span>
            <time dateTime={post.publishedAt ?? undefined}>
              {formatDate(post.publishedAt)}
            </time>
            {post.readingTime ? <span>· {post.readingTime}분</span> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {post.title}
          </h1>
          {post.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
              {post.tags.map((tag) => (
                <span key={tag.id}>#{tag.name}</span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
