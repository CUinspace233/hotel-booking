import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes/index';

// 加载环境变量
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3003;

// ==================== 中间件配置 ====================

// 跨域配置
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // 允许的前端地址
    credentials: true, // 允许携带凭证（Cookie）
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Cookie 解析中间件
app.use(cookieParser());

// JSON 解析
app.use(express.json());

// URL 编码解析
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（图片上传目录）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== 路由配置 ====================

// 健康检查端点
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api', routes);

// ==================== 404 处理 ====================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// ==================== 启动服务 ====================
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 服务端启动成功！`);
  console.log(`📡 地址: http://localhost:${PORT}`);
  console.log(`📋 API 文档: http://localhost:${PORT}/api`);
  console.log('========================================');
  console.log('可用接口:');
  console.log('  POST /api/auth/login    - 用户登录');
  console.log('  POST /api/auth/logout   - 用户登出');
  console.log('  POST /api/auth/register - 用户注册');
  console.log('  GET  /api/auth/profile  - 获取用户信息');
  console.log('  PUT  /api/auth/password - 修改密码');
  console.log('========================================');
});

export default app;
