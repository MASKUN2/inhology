import { PostList } from '@/components/post-list';
import { getPublishedPosts } from '@/lib/api';

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">inhology</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          개발자이자 한 사람으로서의 기록
        </p>
      </header>

      <PostList posts={posts} />
    </main>
  );
}
