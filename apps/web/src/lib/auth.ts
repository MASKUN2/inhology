import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'admin_token';

/** True when the request carries a valid admin session cookie. */
export async function isAuthed(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!token && token === process.env.ADMIN_TOKEN;
}
