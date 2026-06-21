import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deletePost, logout } from './actions';
import { getAllPosts } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: '글 관리' };

export default async function AdminPage() {
  if (!(await isAuthed())) redirect('/admin/login');
  const posts = await getAllPosts();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">글 관리</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/comments" className="text-zinc-500 hover:underline">
            댓글
          </Link>
          <Link
            href="/admin/new"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            새 글
          </Link>
          <form action={logout}>
            <button className="text-zinc-500 hover:underline">로그아웃</button>
          </form>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-zinc-500">아직 글이 없습니다.</p>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  {post.status === 'PUBLISHED' ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      발행
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      초안
                    </span>
                  )}
                  <span className="text-zinc-400">{post.category.name}</span>
                  {post.publishedAt ? (
                    <time className="text-zinc-400">
                      {formatDate(post.publishedAt)}
                    </time>
                  ) : null}
                </div>
                <p className="mt-1 truncate font-medium">{post.title}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-sm">
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-zinc-500 hover:underline"
                >
                  보기
                </Link>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="text-zinc-500 hover:underline"
                >
                  수정
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <button className="text-red-600 hover:underline">삭제</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
