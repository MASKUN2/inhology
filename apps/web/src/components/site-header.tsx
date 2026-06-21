import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-4 text-sm">
        <Link href="/" className="font-semibold tracking-tight">
          inhology
        </Link>
        <div className="flex items-center gap-4 text-zinc-500">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            홈
          </Link>
          <Link
            href="/series"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            시리즈
          </Link>
        </div>
      </nav>
    </header>
  );
}
