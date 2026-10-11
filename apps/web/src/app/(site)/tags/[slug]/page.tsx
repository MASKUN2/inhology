import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostList } from '@/components/post-list';
import { TagBar } from '@/components/tag-bar';
import { getPostsByTag, getTag, getTags } from '@/lib/api';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const tag = await getTag(slug);
  return { title: tag ? tag.name : 'Tag not found' };
}

export default async function TagPage({ params }: Params) {
  const slug = decodeURIComponent((await params).slug);
  const tag = await getTag(slug);
  if (!tag) notFound();

  const [posts, tags] = await Promise.all([getPostsByTag(slug), getTags()]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="text-sm text-muted hover:underline underline-offset-4"
      >
        ← Home
      </Link>

      <header className="mb-8 mt-8">
        <p className="text-sm text-muted">Tag</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{tag.name}</h1>
        <p className="mt-2 text-sm text-muted">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </header>

      <TagBar tags={tags} activeSlug={tag.slug} />
      <PostList posts={posts} />
    </main>
  );
}
