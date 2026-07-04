// 본문 이미지 업로드 (author 전용). multipart 'file' 하나를 받아 검증 후 MinIO에 저장,
// 사이트 상대경로 { url: "/images/<key>" } 반환. 서빙은 /images/[...key] 참고.
import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { MAX_IMAGE_BYTES, putImage, sniffImage } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) {
    return NextResponse.json({ error: '빈 파일입니다.' }, { status: 400 });
  }
  if (buf.length > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: `이미지는 최대 ${MAX_IMAGE_BYTES / 1024 / 1024}MB까지 가능합니다.` },
      { status: 413 },
    );
  }

  const kind = sniffImage(buf);
  if (!kind) {
    return NextResponse.json(
      { error: '지원하지 않는 형식입니다. (PNG·JPEG·WebP·GIF)' },
      { status: 415 },
    );
  }

  try {
    const key = await putImage(buf, kind);
    return NextResponse.json({ url: `/images/${key}` });
  } catch (err) {
    console.error('image upload failed:', err);
    return NextResponse.json({ error: '업로드에 실패했습니다.' }, { status: 502 });
  }
}
