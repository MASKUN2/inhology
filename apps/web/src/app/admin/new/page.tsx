import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createPost, logout } from '../actions';
import { getCategories, getSeriesList } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { BodyEditor } from '@/components/body-editor';

export const metadata: Metadata = { title: '새 글 쓰기' };

const field = 'rounded-md border border-border bg-background px-3 py-2';

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAuthed())) redirect('/admin/login');
  const [{ error }, categories, series] = await Promise.all([
    searchParams,
    getCategories(),
    getSeriesList(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">새 글 쓰기</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="text-muted hover:underline">
            ← 목록
          </Link>
          <form action={logout}>
            <button className="text-muted hover:underline">로그아웃</button>
          </form>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          저장에 실패했습니다. 입력값을 확인해 주세요.
        </p>
      ) : null}

      <form action={createPost} className="mt-8 flex flex-col gap-4">
        <input name="title" placeholder="제목" required className={field} />
        <input name="excerpt" placeholder="요약 (선택)" className={field} />

        <select name="categoryId" required defaultValue="" className={field}>
          <option value="" disabled>
            카테고리 선택
          </option>
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
              defaultValue=""
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
              className={`${field} w-24`}
            />
          </div>
        ) : null}

        <BodyEditor />

        <select name="status" defaultValue="DRAFT" className={field}>
          <option value="DRAFT">초안</option>
          <option value="PUBLISHED">발행</option>
        </select>

        <button
          type="submit"
          className="rounded-md bg-strong px-3 py-2 text-strong-foreground hover:opacity-90"
        >
          저장
        </button>
      </form>
    </main>
  );
}
