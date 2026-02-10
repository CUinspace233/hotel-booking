import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import routes from '@/router';

// 创建路由实例
const router = createBrowserRouter(routes);

// 自定义主题配置（使用蓝色系，避免蓝紫渐变）
const themeConfig = {
  token: {
    colorPrimary: '#1890ff', // 主色调：蓝色
    borderRadius: 6
  }
};

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
