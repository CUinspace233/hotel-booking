import type { RouteObject } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Login, Dashboard, HotelEdit, HotelAudit, HotelDetail } from '@/pages';

// 路由配置
export const routes: RouteObject[] = [
  // 登录页面（独立页面，不使用主布局）
  {
    path: '/login',
    element: <Login />
  },
  // 主布局路由
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'hotel-edit',
        element: <HotelEdit />
      },
      {
        path: 'hotel-detail/:hotelId',
        element: <HotelDetail />
      },
      {
        path: 'hotel-audit',
        element: <HotelAudit />
      }
    ]
  }
];

export default routes;
