import type { Metadata } from 'next';
import Link from 'next/link';
import { getSeriesList } from '@/lib/api';

export const metadata: Metadata = { title: '시리즈' };

export default async function SeriesIndexPage() {
  const series = await getSeriesList();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">시리즈</h1>

      {series.length === 0 ? (
        <p className="mt-8 text-muted">아직 시리즈가 없습니다.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {series.map((s) => (
            <li key={s.id}>
              <Link
                href={`/series/${s.slug}`}
                className="text-lg font-semibold hover:underline underline-offset-4"
              >
                {s.title}
              </Link>
              <span className="ml-2 text-sm text-muted">
                글 {s._count?.posts ?? 0}편
              </span>
              {s.description ? (
                <p className="mt-1 text-muted">{s.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
