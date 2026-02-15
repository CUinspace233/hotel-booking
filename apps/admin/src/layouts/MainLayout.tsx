import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Tabs,
  theme as antTheme,
  Avatar,
  Dropdown,
  Space,
  Breadcrumb,
  Tag
} from 'antd';
import type { MenuProps, TabsProps } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  AuditOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useUserStore, getRoleName } from '@/store';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

// Tab 项类型定义
interface TabItem {
  key: string;
  label: string;
  closable: boolean;
}

// 路由与标签映射
const routeTabMap: Record<string, string> = {
  dashboard: '工作台',
  'hotel-edit': '酒店信息管理',
  'hotel-audit': '酒店审核管理'
};

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, isLoggedIn, logout } = useUserStore();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('dashboard');
  const [tabItems, setTabItems] = useState<TabItem[]>([
    { key: 'dashboard', label: '工作台', closable: false }
  ]);

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = antTheme.useToken();

  // 根据角色生成菜单项
  const menuItems: MenuProps['items'] = useMemo(() => {
    const baseMenus: MenuProps['items'] = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: '工作台'
      },
      {
        key: 'hotel-edit',
        icon: <HomeOutlined />,
        label: '酒店信息管理'
      }
    ];

    // 只有管理员才能看到审核管理菜单
    if (userInfo?.role === 'admin') {
      baseMenus.push({
        key: 'hotel-audit',
        icon: <AuditOutlined />,
        label: '酒店审核管理'
      });
    }

    return baseMenus;
  }, [userInfo?.role]);

  // 检查登录状态，未登录则跳转到登录页
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 根据当前路由更新选中的菜单和 Tab
  useEffect(() => {
    const pathKey = location.pathname.replace('/', '') || 'dashboard';

    // 权限检查：商户不能访问审核页面
    if (pathKey === 'hotel-audit' && userInfo?.role === 'merchant') {
      navigate('/dashboard');
      return;
    }

    setActiveTabKey(pathKey);

    // 如果 Tab 不存在，则添加
    if (!tabItems.find((item) => item.key === pathKey) && routeTabMap[pathKey]) {
      setTabItems((prev) => [
        ...prev,
        {
          key: pathKey,
          label: routeTabMap[pathKey],
          closable: pathKey !== 'dashboard' // 首页不可关闭
        }
      ]);
    }
  }, [location.pathname, tabItems, userInfo?.role, navigate]);

  // 菜单点击处理
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(`/${key}`);
  };

  // Tab 切换处理
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    navigate(`/${key}`);
  };

  // Tab 关闭处理
  const handleTabEdit: TabsProps['onEdit'] = (targetKey, action) => {
    if (action === 'remove' && typeof targetKey === 'string') {
      const targetIndex = tabItems.findIndex((item) => item.key === targetKey);
      const newTabs = tabItems.filter((item) => item.key !== targetKey);
      setTabItems(newTabs);

      // 如果关闭的是当前激活的 Tab，则跳转到相邻 Tab
      if (targetKey === activeTabKey && newTabs.length > 0) {
        const newActiveKey = newTabs[Math.max(0, targetIndex - 1)].key;
        setActiveTabKey(newActiveKey);
        navigate(`/${newActiveKey}`);
      }
    }
  };

  // 退出登录处理
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  // 面包屑项
  const breadcrumbItems = [{ title: '首页' }, { title: routeTabMap[activeTabKey] || '页面' }];

  // 获取当前选中菜单 key
  const currentPathKey = location.pathname.replace('/', '') || 'dashboard';

  // 未登录时不渲染布局
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Layout className="main-layout">
      {/* 侧边栏 */}
      <Sider trigger={null} collapsible collapsed={collapsed} className="main-sider" width={220}>
        <div className="logo">
          <span className="logo-icon">🏨</span>
          {!collapsed && <span className="logo-text">酒店预订管理</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPathKey]}
          items={menuItems}
          onClick={handleMenuClick}
          className="main-menu"
        />
      </Sider>

      <Layout>
        {/* 顶部栏 */}
        <Header className="main-header" style={{ background: colorBgContainer }}>
          <div className="header-left">
            <span className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Breadcrumb items={breadcrumbItems} className="header-breadcrumb" />
          </div>
          <div className="header-right">
            <Tag color={userInfo?.role === 'admin' ? 'blue' : 'green'} style={{ marginRight: 12 }}>
              {userInfo?.role ? getRoleName(userInfo.role) : '未知'}
            </Tag>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="username">{userInfo?.username || '用户'}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* Tab 页签栏 */}
        <div className="tabs-wrapper" style={{ background: colorBgContainer }}>
          <Tabs
            type="editable-card"
            hideAdd
            activeKey={activeTabKey}
            onChange={handleTabChange}
            onEdit={handleTabEdit}
            items={tabItems.map((item) => ({
              key: item.key,
              label: item.label,
              closable: item.closable
            }))}
          />
        </div>

        {/* 内容区域 */}
        <Content
          className="main-content"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
