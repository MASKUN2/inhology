import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostList } from '@/components/post-list';
import { TagBadge } from '@/components/tag-badge';
import { getCollection } from '@/lib/api';

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
  const count = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="text-sm text-muted hover:underline underline-offset-4"
      >
        ← Back to list
      </Link>

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
    </main>
  );
}
