# 易宿酒店预订平台

## 环境准备

本项目使用 **Monorepo** 架构，**必须使用 pnpm** 进行包管理。

1. **Node.js**: >= 18.0.0
2. **pnpm**: 必须安装，禁止使用 npm 或 yarn。

```bash
# 如果没有安装 pnpm，请执行：
npm install -g pnpm
```

## 快速开始

### 1. 安装所有依赖

在根目录下执行，一键安装所有子项目的依赖：

```bash
pnpm install
```

### 2. 启动开发环境

#### 移动端 (C端 - Taro/Vue3)

- **开发人员**: Vue 组
- **命令**:

```bash
# 在浏览器中运行
cd apps/mobile
pnpm run dev:h5

# 在微信小程序模拟器中运行
cd apps/mobile
pnpm run dev:weapp
# 注意：需打开微信开发者工具，导入 `apps/mobile/dist` 目录
```

#### 管理后台 (B端 - React/Vite)

- **开发人员**: React 组
- **命令**:

```bash
cd apps/admin
pnpm run dev
```

#### 后端服务 (Node/Prisma)

- **开发人员**: 全员
- **命令**:

```bash
cd apps/server
pnpm run dev
```

---

## 项目结构

```text
root/
├── apps/
│   ├── mobile/       # C端：用户预订端 (Taro + Vue3 + NutUI)
│   ├── admin/        # B端：商户管理后台 (React + AntD)
│   └── server/       # 服务端：API 接口 (Node + Prisma + SQLite)
│
├── packages/
│   └── shared/       # 公共包：存放 TypeScript 接口定义、工具函数、常量
│
├── pnpm-workspace.yaml # Monorepo 配置文件
└── README.md
```

## 数据库操作

本项目使用 **SQLite** 数据库。

```bash
# 进入服务端目录
cd apps/server

# 1. 同步表结构到数据库 (修改 schema.prisma 后执行)
npx prisma db push

# 2. 打开可视化界面查看数据 (浏览器打开)
npx prisma studio
```

## 协作开发指南

### 1. 安装第三方库

**不要**直接用 `npm install`。请使用以下命令安装到指定子项目：

```bash
# 给移动端安装 axios
pnpm --filter mobile add axios

# 给管理端安装 dayjs
pnpm --filter admin add dayjs

# 给服务端安装 lodash (开发依赖)
pnpm --filter server add lodash -D

```

### 2. Git 提交规范 (Commit Convention)

本项目配置了 `Husky` + `Commitlint`，提交信息必须符合以下格式，否则无法提交：

- `feat: ...` : 新功能 (feature)
- `fix: ...` : 修复 Bug
- `docs: ...` : 文档变更
- `style: ...` : 代码格式/样式调整 (不影响逻辑)
- `refactor: ...` : 代码重构
- `chore: ...` : 构建/工具/配置变动

**正确示例:**

> `feat: 完成酒店列表页筛选功能`
> `fix(mobile): 修复日历组件日期显示错误`

**错误示例:**

> `update list` (没有类型前缀)
> `修复bug` (格式不对)

---

## 常用链接

- [NutUI 文档 (移动端)](https://nutui.jd.com/)
- [Ant Design 文档 (管理端)](https://ant.design/)
- [Prisma 文档 (数据库)](https://www.prisma.io/docs)
