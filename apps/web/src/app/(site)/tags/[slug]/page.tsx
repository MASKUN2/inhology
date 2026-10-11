import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomeLink, PageShell } from '@/components/page';
import { PostList } from '@/components/post-list';
import { TagBar } from '@/components/tag-bar';
import { getPostsByTag, getTag, getTags } from '@/lib/api';
import { countPosts } from '@/lib/format';

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
    <PageShell>
      <HomeLink />

      <header className="mb-8 mt-8">
        <p className="text-sm text-muted">Tag</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{tag.name}</h1>
        <p className="mt-2 text-sm text-muted">{countPosts(posts.length)}</p>
      </header>

      <TagBar tags={tags} activeSlug={tag.slug} />
      <PostList posts={posts} />
    </PageShell>
  );
}
