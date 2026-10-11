import type { Metadata } from 'next';
import { HomeLink, PageShell } from '@/components/page';
import { PostList } from '@/components/post-list';
import { TagBar } from '@/components/tag-bar';
import { getPosts, getTags } from '@/lib/api';
import { countPosts } from '@/lib/format';

export const metadata: Metadata = {
  title: 'All posts',
  description: 'Every post, newest first.',
};

export default async function AllPostsPage() {
  const [posts, tags] = await Promise.all([getPosts(), getTags()]);

  return (
    <PageShell>
      <HomeLink />

      <header className="mb-8 mt-8">
        <h1 className="text-3xl font-bold tracking-tight">All</h1>
        <p className="mt-2 text-muted">Every post, newest first.</p>
        <p className="mt-2 text-sm text-muted">{countPosts(posts.length)}</p>
      </header>

      <TagBar tags={tags} />
      <PostList posts={posts} />
    </PageShell>
  );
}
