'use server';

import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { signIn, signOut } from '@/auth';
import { publishedAtFromDate } from '@/lib/format';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

/**
 * 관리자 세션(Authentik OIDC) 확인 후 API 호출용 토큰을 반환.
 * web→api 는 클러스터 내부 전용이라 공유 ADMIN_TOKEN(서버 환경변수)을 그대로 사용한다.
 */
/**
 * The edit form's publication date (`publishedDate`, YYYY-MM-DD) as the ISO
 * date-time to send, or undefined (omitted → date left as is) when blank.
 */
function publishedAtOf(formData: FormData): string | undefined {
  return publishedAtFromDate(
    String(formData.get('publishedDate') ?? '').trim(),
    String(formData.get('publishedAtOriginal') ?? '').trim() || null,
  );
}

/** A comma-separated tag field (`tags` on a post, `rules` on a collection) as a list of names. */
function tagsOf(formData: FormData, field = 'tags'): string[] {
  return String(formData.get(field) ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

async function adminToken(): Promise<string> {
  if (!(await isAuthed())) redirect('/admin/login');
  return process.env.ADMIN_TOKEN ?? '';
}

export async function login() {
  await signIn('authentik', { redirectTo: '/admin' });
}

export async function logout() {
  await signOut({ redirectTo: '/admin/login' });
}

/**
 * Explicit "Save" for both the new-post and edit-post forms. Branches on a
 * hidden `id`: present → PATCH an existing post, absent → POST a new one.
 * Unifying the two matters for autosave: once autosave has created a draft it
 * fills the form's hidden `id`, so a later manual Save updates that same draft
 * instead of creating a duplicate (which would also collide on the unique slug).
 */
export async function savePost(formData: FormData) {
  const token = await adminToken();

  const id = String(formData.get('id') ?? '').trim();
  const payload: Record<string, unknown> = {
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
    excerpt: String(formData.get('excerpt') ?? '').trim() || undefined,
    tags: tagsOf(formData),
    status: String(formData.get('status') ?? 'DRAFT'),
  };

  let res: Response;
  if (id) {
    payload.publishedAt = publishedAtOf(formData);
    res = await fetch(`${API_URL}/posts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } else {
    res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  }

  if (!res.ok) {
    redirect(id ? `/admin/posts/${id}/edit?error=1` : '/admin/new?error=1');
  }
  const post = await res.json();
  // A draft has no public page (it 404s), so land on the dashboard instead.
  // Encode the slug: Hangul slugs are non-Latin1 and would otherwise crash the
  // server-action redirect (Next sets it as the x-action-redirect header).
  redirect(
    post.status === 'PUBLISHED'
      ? `/posts/${encodeURIComponent(post.slug)}`
      : '/admin',
  );
}

/**
 * Autosave, called periodically from the client editor (not a form submit) —
 * returns a result instead of redirecting. It never changes a post's
 * publication state: on create it forces status=DRAFT; on update it omits
 * `status` entirely. Runs for drafts and published posts alike — for a
 * published post the content edit is saved to the live post immediately.
 */
export async function autosavePost(formData: FormData): Promise<{
  ok: boolean;
  id?: string;
  slug?: string;
  reason?: string;
}> {
  const token = await adminToken();

  const id = String(formData.get('id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim() || undefined;

  try {
    let res: Response;
    if (id) {
      // No `status` → publication state is left untouched.
      const payload: Record<string, unknown> = {
        title: String(formData.get('title') ?? ''),
        content: String(formData.get('content') ?? ''),
        excerpt,
        tags: tagsOf(formData),
        publishedAt: publishedAtOf(formData),
      };
      res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
    } else {
      // Create needs a title and content — until both exist there is nothing
      // valid to persist yet.
      if (!title || !content) {
        return { ok: false, reason: 'incomplete' };
      }
      const payload: Record<string, unknown> = {
        title: String(formData.get('title') ?? ''),
        content: String(formData.get('content') ?? ''),
        excerpt,
        tags: tagsOf(formData),
        status: 'DRAFT',
      };
      res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
    }

    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    const post = await res.json();
    return { ok: true, id: post.id, slug: post.slug };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export async function deletePost(formData: FormData) {
  const token = await adminToken();

  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin');

  await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  redirect('/admin');
}

/**
 * Create or update a collection. Branches on a hidden `id` like savePost:
 * present → PATCH, absent → POST. `rules` replaces the whole rule set.
 */
export async function saveCollection(formData: FormData) {
  const token = await adminToken();

  const id = String(formData.get('id') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const payload: Record<string, unknown> = {
    title: String(formData.get('title') ?? '').trim(),
    rules: tagsOf(formData, 'rules'),
  };
  // On update an empty description clears it (null); on create it is just omitted.
  if (id) payload.description = description || null;
  else if (description) payload.description = description;

  const res = await fetch(`${API_URL}/collections${id ? `/${id}` : ''}`, {
    method: id ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  redirect(res.ok ? '/admin/collections' : '/admin/collections?error=1');
}

/**
 * Save the collections' order. Called from the drag-and-drop list (not a form
 * submit), so it returns a result instead of redirecting.
 */
export async function reorderCollections(ids: string[]): Promise<boolean> {
  const token = await adminToken();

  try {
    const res = await fetch(`${API_URL}/collections/order`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteCollection(formData: FormData) {
  const token = await adminToken();

  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/collections');

  await fetch(`${API_URL}/collections/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  redirect('/admin/collections');
}

export async function moderateComment(formData: FormData) {
  const token = await adminToken();

  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || !status) redirect('/admin/comments');

  await fetch(`${API_URL}/comments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
    cache: 'no-store',
  });

  redirect('/admin/comments');
}

export async function deleteComment(formData: FormData) {
  const token = await adminToken();

  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/comments');

  await fetch(`${API_URL}/comments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  redirect('/admin/comments');
}
