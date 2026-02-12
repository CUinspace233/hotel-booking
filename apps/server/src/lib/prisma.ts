// Prisma 7.x 需要使用 Driver Adapter 模式
// 参考: https://www.prisma.io/docs/orm/prisma-client/databases/sqlite
import { PrismaClient } from '.prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

// 声明全局变量类型
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prisma 7.x 使用新的 AdapterFactory 模式
// PrismaLibSql 需要传入配置对象，会自动创建 libsql 客户端
const adapter = new PrismaLibSql({
  url: `file:${path.join(process.cwd(), 'dev.db')}`
});

// 创建 Prisma 客户端单例
// 在开发环境中使用全局变量，避免热重载时创建多个实例
const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
