import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// 酒店类型枚举
type HotelType = 'business' | 'resort' | 'boutique' | 'budget' | 'apartment';

// 酒店状态枚举
type HotelStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';

// 酒店基础数据类型
interface HotelBaseData {
  hotelId: string; // 唯一酒店ID
  name: string; // 酒店名称
  creator: string; // 创建人
  hotelType: HotelType; // 酒店类型
  status: HotelStatus; // 状态
  createTime: string; // 创建日期
}

// 模拟数据
const mockData: HotelBaseData[] = [
  {
    hotelId: 'HTL20240115001',
    name: '北京朝阳商务酒店',
    creator: '张三',
    hotelType: 'business',
    status: 'draft',
    createTime: '2024-01-15'
  },
  {
    hotelId: 'HTL20240116002',
    name: '三亚海棠湾度假酒店',
    creator: '李四',
    hotelType: 'resort',
    status: 'pending',
    createTime: '2024-01-16'
  },
  {
    hotelId: 'HTL20240117003',
    name: '上海外滩精品酒店',
    creator: '王五',
    hotelType: 'boutique',
    status: 'approved',
    createTime: '2024-01-17'
  },
  {
    hotelId: 'HTL20240118004',
    name: '杭州西湖经济酒店',
    creator: '赵六',
    hotelType: 'budget',
    status: 'rejected',
    createTime: '2024-01-18'
  }
];

// 酒店类型映射
const hotelTypeMap: Record<HotelType, string> = {
  business: '商务酒店',
  resort: '度假酒店',
  boutique: '精品酒店',
  budget: '经济酒店',
  apartment: '公寓式酒店'
};

// 状态标签映射
const statusMap: Record<HotelStatus, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '提审中' },
  approved: { color: 'success', text: '审核通过' },
  rejected: { color: 'error', text: '审核驳回' },
  offline: { color: 'warning', text: '已下线' }
};

// 生成唯一酒店ID
const generateHotelId = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `HTL${dateStr}${random}`;
};

const HotelEdit: React.FC = () => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<HotelBaseData[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 打开新建弹窗
  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  // 跳转到详情编辑页面
  const handleEditDetail = (record: HotelBaseData) => {
    // 跳转到详情页面，传递hotelId作为参数
    navigate(`/hotel-detail/${record.hotelId}`);
  };

  // 查看详情
  const handleViewDetail = (record: HotelBaseData) => {
    navigate(`/hotel-detail/${record.hotelId}?mode=view`);
  };

  // 删除酒店
  const handleDelete = (hotelId: string) => {
    setDataSource(dataSource.filter((item) => item.hotelId !== hotelId));
    message.success('删除成功');
  };

  // 提交审核
  const handleSubmitReview = (record: HotelBaseData) => {
    setDataSource(
      dataSource.map((item) =>
        item.hotelId === record.hotelId ? { ...item, status: 'pending' as const } : item
      )
    );
    message.success('已提交审核');
  };

  // 保存新建酒店基础信息
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const newHotel: HotelBaseData = {
        ...values,
        hotelId: generateHotelId(),
        creator: '当前用户', // 实际应从登录状态获取
        status: 'draft',
        createTime: new Date().toISOString().split('T')[0]
      };
      setDataSource([...dataSource, newHotel]);
      message.success('酒店创建成功，请点击编辑完善详细信息');
      setModalVisible(false);
    } catch {
      message.error('请检查表单信息');
    }
  };

  // 表格列定义
  const columns: ColumnsType<HotelBaseData> = [
    {
      title: '酒店ID',
      dataIndex: 'hotelId',
      key: 'hotelId',
      width: 160,
      render: (hotelId: string) => (
        <Text copyable={{ text: hotelId }} style={{ fontFamily: 'monospace' }}>
          {hotelId}
        </Text>
      )
    },
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100
    },
    {
      title: '酒店类型',
      dataIndex: 'hotelType',
      key: 'hotelType',
      width: 120,
      render: (type: HotelType) => hotelTypeMap[type] || type
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: HotelStatus) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      )
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditDetail(record)}
          >
            编辑
          </Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => handleSubmitReview(record)}>
              提交审核
            </Button>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Popconfirm title="确定要删除此酒店吗？" onConfirm={() => handleDelete(record.hotelId)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <HomeOutlined style={{ marginRight: 8 }} />
        酒店信息管理
      </h2>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建酒店
            </Button>
          </Space>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'auto' }}>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="hotelId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            scroll={{ x: 'max-content' }}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
      </Card>

      {/* 新建酒店弹窗 - 只填写基础信息 */}
      <Modal
        title="新建酒店"
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={500}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="酒店名称"
            rules={[{ required: true, message: '请输入酒店名称' }]}
          >
            <Input placeholder="请输入酒店名称" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="hotelType"
            label="酒店类型"
            rules={[{ required: true, message: '请选择酒店类型' }]}
          >
            <Select placeholder="请选择酒店类型">
              <Select.Option value="business">商务酒店</Select.Option>
              <Select.Option value="resort">度假酒店</Select.Option>
              <Select.Option value="boutique">精品酒店</Select.Option>
              <Select.Option value="budget">经济酒店</Select.Option>
              <Select.Option value="apartment">公寓式酒店</Select.Option>
            </Select>
          </Form.Item>

          <Row>
            <Col span={24}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                提示：创建酒店后，系统将自动生成唯一酒店ID。您可以点击"编辑"按钮完善酒店详细信息。
              </Text>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default HotelEdit;
