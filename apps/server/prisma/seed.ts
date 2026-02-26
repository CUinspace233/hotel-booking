/**
 * Seed 脚本：为已有 approved 酒店写入初始 HotelStats 统计数据
 *
 * 用法：npx tsx prisma/seed.ts
 */
import { PrismaClient } from '.prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

const adapter = new PrismaLibSql({
  url: `file:${path.join(process.cwd(), 'dev.db')}`
});

const prisma = new PrismaClient({ adapter });

/**
 * 根据星级生成合理的随机评分
 * 5星 → 4.5~4.9
 * 4星 → 4.0~4.6
 * 3星 → 3.5~4.2
 * 其他 → 3.0~4.0
 */
function generateScore(starRating: number | null): number {
  let min: number, max: number;
  switch (starRating) {
    case 5:
      min = 4.5;
      max = 4.9;
      break;
    case 4:
      min = 4.0;
      max = 4.6;
      break;
    case 3:
      min = 3.5;
      max = 4.2;
      break;
    default:
      min = 3.0;
      max = 4.0;
      break;
  }
  const score = min + Math.random() * (max - min);
  return Math.round(score * 10) / 10; // 保留 1 位小数
}

/**
 * 根据星级生成合理的评论数
 * 高星级酒店通常评论更多
 */
function generateReviewCount(starRating: number | null): number {
  let min: number, max: number;
  switch (starRating) {
    case 5:
      min = 200;
      max = 2000;
      break;
    case 4:
      min = 100;
      max = 1000;
      break;
    case 3:
      min = 50;
      max = 500;
      break;
    default:
      min = 10;
      max = 200;
      break;
  }
  return Math.floor(min + Math.random() * (max - min));
}

async function main() {
  // 获取所有 approved 酒店（关联 published detail 以取星级）
  const projects = await prisma.hotelProject.findMany({
    where: { status: 'approved', isDeleted: false },
    include: {
      details: {
        where: { version: 'published' },
        select: { starRating: true }
      }
    }
  });

  console.log(`找到 ${projects.length} 个已审核酒店，开始写入统计数据...`);

  let created = 0;
  let skipped = 0;

  for (const project of projects) {
    const starRating = project.details[0]?.starRating ?? null;
    const score = generateScore(starRating);
    const reviewCount = generateReviewCount(starRating);

    await prisma.hotelStats.upsert({
      where: { hotelId: project.hotelId },
      create: {
        hotelId: project.hotelId,
        score,
        reviewCount
      },
      update: {} // 已存在则不覆盖
    });

    const existing = await prisma.hotelStats.findUnique({ where: { hotelId: project.hotelId } });
    if (existing && existing.score === score) {
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`完成！新增 ${created} 条，跳过 ${skipped} 条已有数据。`);
}

main()
  .catch((e) => {
    console.error('Seed 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
