import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Idempotent: re-running upserts by unique slug, so it is safe to run repeatedly.
async function main() {
  const dev = await prisma.category.upsert({
    where: { slug: 'dev' },
    update: {},
    create: { slug: 'dev', name: '개발', description: '개발과 기술 이야기' },
  });
  await prisma.category.upsert({
    where: { slug: 'life' },
    update: {},
    create: { slug: 'life', name: '일상', description: '하루하루의 기록' },
  });
  await prisma.category.upsert({
    where: { slug: 'essay' },
    update: {},
    create: { slug: 'essay', name: '에세이', description: '생각과 단상' },
  });

  const tagDefs = [
    { slug: 'typescript', name: 'TypeScript' },
    { slug: 'nestjs', name: 'NestJS' },
    { slug: 'retrospective', name: '회고' },
  ];
  const tags = [];
  for (const t of tagDefs) {
    tags.push(
      await prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t }),
    );
  }

  await prisma.post.upsert({
    where: { slug: 'hello-inhology' },
    update: {},
    create: {
      slug: 'hello-inhology',
      title: 'inhology를 시작하며',
      excerpt: 'inhology 블로그의 첫 글입니다.',
      content:
        '# 안녕하세요\n\ninhology — 개발자이자 한 사람으로서의 기록을 모으는 공간입니다.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      readingTime: 1,
      category: { connect: { id: dev.id } },
      tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
    },
  });

  console.log('Seed complete:', {
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    posts: await prisma.post.count(),
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
