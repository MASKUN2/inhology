import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { login } from '../actions';
import { isAuthed } from '@/lib/auth';

export const metadata: Metadata = { title: '관리자 로그인' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthed()) redirect('/admin');
  const { error } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-24">
      <h1 className="text-2xl font-bold tracking-tight">관리자 로그인</h1>
      <form action={login} className="mt-8 flex flex-col gap-4">
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          autoFocus
          required
          className="rounded-md border border-border bg-background px-3 py-2"
        />
        {error ? (
          <p className="text-sm text-red-600">비밀번호가 올바르지 않습니다.</p>
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-strong px-3 py-2 text-strong-foreground hover:opacity-90"
        >
          로그인
        </button>
      </form>

      <Link
        href="/"
        className="mt-6 inline-block text-sm text-muted hover:underline"
      >
        ← 사이트로 돌아가기
      </Link>
    </main>
  );
}
