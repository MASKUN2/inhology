import { CollectionList } from '@/components/collection-list';
import { PostList } from '@/components/post-list';
import { TagBar } from '@/components/tag-bar';
import { getCollections, getPublishedPosts, getTags } from '@/lib/api';

export default async function Home() {
  const [posts, tags, collections] = await Promise.all([
    getPublishedPosts(),
    getTags(),
    getCollections(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">inhology</h1>
        <p className="mt-2 text-muted">Notes from a developer and a person.</p>
      </header>

      <CollectionList collections={collections} />
      <TagBar tags={tags} />
      <PostList posts={posts} />
    </main>
  );
}
