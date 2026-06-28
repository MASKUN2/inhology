import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { login } from '../actions';
import { isAuthed } from '@/lib/auth';

export const metadata: Metadata = { title: '관리자 로그인' };

export default async function LoginPage() {
  if (await isAuthed()) redirect('/admin');

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-24">
      <h1 className="text-2xl font-bold tracking-tight">관리자 로그인</h1>
      <p className="mt-2 text-sm text-muted">
        Authentik 계정(SSO)으로 로그인합니다.
      </p>
      <form action={login} className="mt-8">
        <button
          type="submit"
          className="w-full rounded-md bg-strong px-3 py-2 text-strong-foreground hover:opacity-90"
        >
          Authentik으로 로그인
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
