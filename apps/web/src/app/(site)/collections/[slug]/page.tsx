import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomeLink, PageShell } from '@/components/page';
import { PostList } from '@/components/post-list';
import { TagBadge } from '@/components/tag-badge';
import { getCollection } from '@/lib/api';
import { countPosts } from '@/lib/format';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const collection = await getCollection(slug);
  if (!collection) return { title: 'Collection not found' };
  return {
    title: collection.title,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionPage({ params }: Params) {
  const slug = decodeURIComponent((await params).slug);
  const collection = await getCollection(slug);
  if (!collection) notFound();
  const posts = collection.posts ?? [];
  const count = countPosts(posts.length);

  return (
    <PageShell>
      <HomeLink />

      <header className="mb-10 mt-8">
        <p className="text-sm text-muted">Collection</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {collection.title}
        </h1>
        {collection.description ? (
          <p className="mt-2 text-muted">{collection.description}</p>
        ) : null}
        {/* The rules: a post is listed when it carries every one of these tags. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          {collection.tags.length > 0 ? (
            <>
              <span>{count} tagged</span>
              {collection.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </>
          ) : (
            <span>All posts · {count}</span>
          )}
        </div>
      </header>

      <PostList posts={posts} />
    </PageShell>
  );
}
