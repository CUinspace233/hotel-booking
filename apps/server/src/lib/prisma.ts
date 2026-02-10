// Prisma 客户端导入 - Prisma 7.x 在 Monorepo 下需要直接导入生成的客户端
import { PrismaClient } from '.prisma/client/index';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建适配器 - Prisma 7.x 的 PrismaLibSql 接收配置对象
// 数据库文件在 apps/server/dev.db（根目录）
const adapter = new PrismaLibSql({
  url: `file:${path.resolve(__dirname, '../../dev.db')}`
});

// 声明全局变量，避免开发环境热重载时创建多个实例
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 创建 Prisma 客户端单例 - Prisma 7.x 需要传入 adapter
export const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

// 开发环境下保存到全局变量
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
