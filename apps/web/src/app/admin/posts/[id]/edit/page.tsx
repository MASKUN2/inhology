import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { deletePost, updatePost } from '../../../actions';
import { getAdminPost, getCategories, getSeriesList } from '@/lib/api';
import { isAuthed } from '@/lib/auth';

export const metadata: Metadata = { title: '글 수정' };

const field =
  'rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900';

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAuthed())) redirect('/admin/login');
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [post, categories, series] = await Promise.all([
    getAdminPost(id),
    getCategories(),
    getSeriesList(),
  ]);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">글 수정</h1>
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">
          ← 목록
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          저장에 실패했습니다. 입력값을 확인해 주세요.
        </p>
      ) : null}

      <form action={updatePost} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="id" value={post.id} />
        <input
          name="title"
          placeholder="제목"
          required
          defaultValue={post.title}
          className={field}
        />
        <input
          name="excerpt"
          placeholder="요약 (선택)"
          defaultValue={post.excerpt ?? ''}
          className={field}
        />

        <select
          name="categoryId"
          required
          defaultValue={post.category.id}
          className={field}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {series.length > 0 ? (
          <div className="flex gap-3">
            <select
              name="seriesId"
              defaultValue={post.series?.id ?? ''}
              className={`${field} flex-1`}
            >
              <option value="">시리즈 없음</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <input
              name="seriesOrder"
              type="number"
              min={0}
              placeholder="순서"
              defaultValue={post.seriesOrder ?? ''}
              className={`${field} w-24`}
            />
          </div>
        ) : null}

        <textarea
          name="content"
          placeholder="본문 (Markdown)"
          required
          rows={16}
          defaultValue={post.content}
          className={`${field} font-mono`}
        />

        <select name="status" defaultValue={post.status} className={field}>
          <option value="DRAFT">초안</option>
          <option value="PUBLISHED">발행</option>
        </select>

        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          저장
        </button>
      </form>

      <form action={deletePost} className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <input type="hidden" name="id" value={post.id} />
        <button className="text-sm text-red-600 hover:underline">
          이 글 삭제
        </button>
      </form>
    </main>
  );
}
