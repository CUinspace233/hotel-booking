import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Result, Typography } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * 酒店详情编辑页面（占位组件）
 *
 * 功能说明：
 * - 根据 hotelId 请求酒店详细信息
 * - 支持查看模式（mode=view）和编辑模式
 * - 包含酒店的完整信息编辑功能
 *
 * TODO: 待实现的功能
 * - 酒店基本信息编辑（地址、电话、描述等）
 * - 酒店图片管理
 * - 房型信息管理
 * - 设施服务配置
 * - 价格策略设置
 */
const HotelDetail: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 获取模式参数：view-查看模式，其他-编辑模式
  const mode = searchParams.get('mode');
  const isViewMode = mode === 'view';

  // 返回列表页
  const handleBack = () => {
    navigate('/hotel-edit');
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            <HomeOutlined style={{ marginRight: 8 }} />
            {isViewMode ? '酒店详情' : '编辑酒店信息'}
          </Title>
        </Space>
        {isViewMode && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/hotel-detail/${hotelId}`)}
          >
            编辑
          </Button>
        )}
      </div>

      <Card>
        <Result
          status="info"
          title="酒店详情编辑页面（开发中）"
          subTitle={
            <div style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
              <Paragraph>
                <Text strong>当前酒店ID：</Text>
                <Text code>{hotelId}</Text>
              </Paragraph>
              <Paragraph>
                <Text strong>当前模式：</Text>
                <Text>{isViewMode ? '查看模式' : '编辑模式'}</Text>
              </Paragraph>
              <Paragraph type="secondary">此页面为占位组件，后续将实现以下功能：</Paragraph>
              <ul style={{ textAlign: 'left', color: '#666' }}>
                <li>酒店基本信息编辑（地址、电话、星级、描述等）</li>
                <li>酒店图片管理（上传、排序、删除）</li>
                <li>房型信息管理（添加、编辑房型）</li>
                <li>设施服务配置（WiFi、停车场、餐厅等）</li>
                <li>价格策略设置</li>
                <li>审核提交与状态管理</li>
              </ul>
            </div>
          }
          extra={[
            <Button key="back" onClick={handleBack}>
              返回列表
            </Button>
          ]}
        />
      </Card>
    </div>
  );
};

export default HotelDetail;
