import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSeries, deleteSeries } from '../actions';
import { getSeriesList } from '@/lib/api';
import { isAuthed } from '@/lib/auth';

export const metadata: Metadata = { title: '시리즈 관리' };

const field = 'rounded-md border border-border bg-background px-3 py-2';

export default async function AdminSeriesPage() {
  if (!(await isAuthed())) redirect('/admin/login');
  const series = await getSeriesList();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">시리즈 관리</h1>
        <Link href="/admin" className="text-sm text-muted hover:underline">
          ← 글 관리
        </Link>
      </div>

      <form action={createSeries} className="mt-8 flex flex-col gap-3">
        <input name="title" placeholder="시리즈 제목" required className={field} />
        <input name="description" placeholder="설명 (선택)" className={field} />
        <button
          type="submit"
          className="self-end rounded-md bg-strong px-4 py-2 text-sm text-strong-foreground hover:opacity-90"
        >
          시리즈 추가
        </button>
      </form>

      {series.length === 0 ? (
        <p className="mt-10 text-muted">아직 시리즈가 없습니다.</p>
      ) : (
        <ul className="mt-10 flex flex-col divide-y divide-border">
          {series.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/series/${s.slug}`}
                  className="font-medium hover:underline"
                >
                  {s.title}
                </Link>
                <span className="ml-2 text-xs text-muted">
                  글 {s._count?.posts ?? 0}편
                </span>
              </div>
              <form action={deleteSeries}>
                <input type="hidden" name="id" value={s.id} />
                <button className="text-sm text-red-600 hover:underline">
                  삭제
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs text-muted">
        시리즈에 글을 넣으려면 글 작성/수정 화면에서 시리즈와 순서를
        지정하세요. 시리즈를 삭제해도 글은 사라지지 않고 시리즈에서만
        빠집니다.
      </p>
    </main>
  );
}
