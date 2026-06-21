'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE } from '@/lib/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1');
  }
  (await cookies()).set(ADMIN_COOKIE, process.env.ADMIN_TOKEN ?? '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8h
  });
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

export async function createPost(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) redirect('/admin/login');

  const seriesId = String(formData.get('seriesId') ?? '').trim();
  const seriesOrder = String(formData.get('seriesOrder') ?? '').trim();
  const payload: Record<string, unknown> = {
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
    excerpt: String(formData.get('excerpt') ?? '').trim() || undefined,
    categoryId: String(formData.get('categoryId') ?? ''),
    status: String(formData.get('status') ?? 'DRAFT'),
  };
  if (seriesId) {
    payload.seriesId = seriesId;
    if (seriesOrder) payload.seriesOrder = Number(seriesOrder);
  }

  const res = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect('/admin/new?error=1');
  }
  const post = await res.json();
  // A draft has no public page (it 404s), so land on the dashboard instead.
  redirect(post.status === 'PUBLISHED' ? `/posts/${post.slug}` : '/admin');
}

export async function updatePost(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) redirect('/admin/login');

  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin');

  const seriesId = String(formData.get('seriesId') ?? '').trim();
  const seriesOrder = String(formData.get('seriesOrder') ?? '').trim();
  const payload: Record<string, unknown> = {
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
    excerpt: String(formData.get('excerpt') ?? '').trim() || undefined,
    categoryId: String(formData.get('categoryId') ?? ''),
    status: String(formData.get('status') ?? 'DRAFT'),
    // null detaches the post from any series; @IsOptional() permits null.
    seriesId: seriesId || null,
    seriesOrder: seriesId && seriesOrder ? Number(seriesOrder) : null,
  };

  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect(`/admin/posts/${id}/edit?error=1`);
  }
  const post = await res.json();
  redirect(post.status === 'PUBLISHED' ? `/posts/${post.slug}` : '/admin');
}

export async function deletePost(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) redirect('/admin/login');

  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin');

  await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  redirect('/admin');
}

export async function createSeries(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) redirect('/admin/login');

  const payload = {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? '').trim() || undefined,
  };

  await fetch(`${API_URL}/series`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  redirect('/admin/series');
}

export async function deleteSeries(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) redirect('/admin/login');

  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/series');

  await fetch(`${API_URL}/series/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  redirect('/admin/series');
}

export async function moderateComment(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) redirect('/admin/login');

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
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) redirect('/admin/login');

  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/comments');

  await fetch(`${API_URL}/comments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  redirect('/admin/comments');
}
