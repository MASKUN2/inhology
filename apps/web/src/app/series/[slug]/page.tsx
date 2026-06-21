import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSeries } from '@/lib/api';
import { formatDate } from '@/lib/format';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const series = await getSeries(slug);
  if (!series) return { title: '시리즈를 찾을 수 없습니다' };
  return { title: series.title, description: series.description ?? undefined };
}

export default async function SeriesPage({ params }: Params) {
  const slug = decodeURIComponent((await params).slug);
  const series = await getSeries(slug);
  if (!series) notFound();
  const posts = series.posts ?? [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/series"
        className="text-sm text-zinc-500 hover:underline underline-offset-4"
      >
        ← 시리즈 목록
      </Link>

      <header className="mt-8">
        <p className="text-xs uppercase tracking-wide text-zinc-400">시리즈</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {series.title}
        </h1>
        {series.description ? (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {series.description}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-zinc-400">전체 {posts.length}편</p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-10 text-zinc-500">아직 글이 없습니다.</p>
      ) : (
        <ol className="mt-10 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {posts.map((post, i) => (
            <li key={post.id} className="flex items-baseline gap-4 py-4">
              <span className="w-6 shrink-0 text-right text-sm tabular-nums text-zinc-400">
                {i + 1}
              </span>
              <div>
                <Link
                  href={`/posts/${post.slug}`}
                  className="font-medium hover:underline underline-offset-4"
                >
                  {post.title}
                </Link>
                <div className="mt-0.5 text-xs text-zinc-400">
                  <time dateTime={post.publishedAt ?? undefined}>
                    {formatDate(post.publishedAt)}
                  </time>
                  {post.readingTime ? <span> · {post.readingTime}분</span> : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
