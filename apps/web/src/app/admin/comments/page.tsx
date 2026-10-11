import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deleteComment, moderateComment } from '../actions';
import { getComments } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { AdminBackLink, AdminHeader, PageShell } from '@/components/page';

export const metadata: Metadata = { title: 'Manage comments' };

const TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'SPAM', label: 'Spam' },
] as const;

// The moves a comment can make; the one to the status being viewed is left out.
const MOVES = [
  {
    status: 'APPROVED',
    label: 'Approve',
    className: 'text-green-700 hover:underline dark:text-green-400',
  },
  {
    status: 'SPAM',
    label: 'Spam',
    className: 'text-amber-700 hover:underline dark:text-amber-400',
  },
  {
    status: 'PENDING',
    label: 'Set pending',
    className: 'text-muted hover:underline',
  },
] as const;

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!(await isAuthed())) redirect('/admin/login');
  const { status } = await searchParams;
  const active = TABS.some((t) => t.key === status) ? status! : 'PENDING';
  const comments = await getComments(active);

  return (
    <PageShell>
      <AdminHeader title="Manage comments">
        <AdminBackLink>← Manage posts</AdminBackLink>
      </AdminHeader>

      <nav className="mt-6 flex gap-2 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/comments?status=${t.key}`}
            className={
              t.key === active
                ? 'rounded-full bg-strong px-3 py-1 text-strong-foreground'
                : 'rounded-full bg-subtle px-3 py-1 text-muted hover:opacity-80'
            }
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {comments.length === 0 ? (
        <p className="mt-8 text-muted">No comments in this status.</p>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-border">
          {comments.map((c) => (
            <li key={c.id} className="py-5">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-medium">{c.authorName}</span>
                {c.authorEmail ? (
                  <span className="text-xs text-muted">{c.authorEmail}</span>
                ) : null}
                <time className="text-xs text-muted">
                  {formatDate(c.createdAt)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-foreground">
                {c.content}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                <Link
                  href={`/posts/${c.post.slug}#comments`}
                  className="hover:underline"
                >
                  {c.post.title}
                </Link>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm">
                {MOVES.filter((move) => move.status !== active).map((move) => (
                  <form key={move.status} action={moderateComment}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value={move.status} />
                    <button className={move.className}>{move.label}</button>
                  </form>
                ))}
                <form action={deleteComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-red-600 hover:underline">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
