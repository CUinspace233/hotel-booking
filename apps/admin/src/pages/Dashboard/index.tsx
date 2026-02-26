import { Card } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useUserStore, getRoleName } from '@/store';

const Dashboard: React.FC = () => {
  const { userInfo } = useUserStore();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <HomeOutlined style={{ marginRight: 8 }} />
        工作台
      </h2>

      <Card>
        <h3 style={{ margin: 0 }}>
          👋 欢迎回来，{userInfo?.username || '用户'}
          <span style={{ fontSize: 14, color: '#666', marginLeft: 12 }}>
            （{userInfo?.role ? getRoleName(userInfo.role) : '未知角色'}）
          </span>
        </h3>
        <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
          {userInfo?.role === 'admin'
            ? '您可以管理酒店信息，并对提交的酒店进行审核、发布和下线操作。'
            : '您可以录入和编辑酒店信息，提交审核后等待管理员审批。'}
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;
