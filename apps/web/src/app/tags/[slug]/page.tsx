import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostList } from '@/components/post-list';
import { getPostsByTag, getTag } from '@/lib/api';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  return { title: tag ? `#${tag.name}` : '태그를 찾을 수 없습니다' };
}

export default async function TagPage({ params }: Params) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) notFound();

  const posts = await getPostsByTag(slug);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:underline underline-offset-4"
      >
        ← 목록으로
      </Link>

      <header className="mb-12 mt-8">
        <p className="text-sm text-zinc-500">태그</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">#{tag.name}</h1>
      </header>

      <PostList posts={posts} />
    </main>
  );
}
