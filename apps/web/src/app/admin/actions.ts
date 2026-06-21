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

  const payload = {
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
    excerpt: String(formData.get('excerpt') ?? '').trim() || undefined,
    categoryId: String(formData.get('categoryId') ?? ''),
    status: String(formData.get('status') ?? 'DRAFT'),
  };

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

  const payload = {
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
    excerpt: String(formData.get('excerpt') ?? '').trim() || undefined,
    categoryId: String(formData.get('categoryId') ?? ''),
    status: String(formData.get('status') ?? 'DRAFT'),
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
