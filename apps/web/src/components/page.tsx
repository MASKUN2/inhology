import type { ReactNode } from 'react';
import Link from 'next/link';

/** The centred column every page except the login screen is laid out in. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {children}
    </main>
  );
}

/** The link back to the home page that opens a public page. */
export function HomeLink() {
  return (
    <Link
      href="/"
      className="text-sm text-muted hover:underline underline-offset-4"
    >
      ← Home
    </Link>
  );
}

/** An admin page's title row; `children` are the links and actions on the right. */
export function AdminHeader({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}

/** The link back to the dashboard that most admin pages carry in their header. */
export function AdminBackLink({ children }: { children: ReactNode }) {
  return (
    <Link href="/admin" className="text-sm text-muted hover:underline">
      {children}
    </Link>
  );
}
