import { Card, Row, Col, Statistic } from 'antd';
import {
  HomeOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useUserStore, getRoleName } from '@/store';

const Dashboard: React.FC = () => {
  const { userInfo } = useUserStore();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <HomeOutlined style={{ marginRight: 8 }} />
        工作台
      </h2>

      {/* 欢迎信息 */}
      <Card style={{ marginBottom: 24 }}>
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

      {/* 数据统计卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="我的酒店"
              value={5}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={2}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已发布"
              value={3}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已下线"
              value={0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作提示 */}
      <Card title="快捷操作" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" hoverable>
              <h4 style={{ margin: 0 }}>📝 酒店信息管理</h4>
              <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
                录入、编辑酒店基本信息，上传图片，提交审核
              </p>
            </Card>
          </Col>
          {userInfo?.role === 'admin' && (
            <Col span={12}>
              <Card size="small" hoverable>
                <h4 style={{ margin: 0 }}>✅ 酒店审核管理</h4>
                <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
                  审核待发布酒店，管理酒店上线/下线状态
                </p>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
