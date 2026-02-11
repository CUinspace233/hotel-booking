import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Popconfirm,
  Tag,
  Row,
  Col
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  HomeOutlined
} from '@ant-design/icons';

// 酒店数据类型
interface HotelData {
  id: string;
  name: string;
  address: string;
  phone: string;
  star: number;
  roomCount: number;
  description: string;
  status: 'draft' | 'pending' | 'published' | 'offline';
  createTime: string;
}

// 模拟数据
const mockData: HotelData[] = [
  {
    id: '1',
    name: '示例酒店A',
    address: '北京市朝阳区xxx路xxx号',
    phone: '010-12345678',
    star: 5,
    roomCount: 200,
    description: '五星级豪华酒店',
    status: 'draft',
    createTime: '2024-01-15'
  },
  {
    id: '2',
    name: '示例酒店B',
    address: '上海市浦东新区xxx路xxx号',
    phone: '021-87654321',
    star: 4,
    roomCount: 150,
    description: '商务精选酒店',
    status: 'pending',
    createTime: '2024-01-16'
  }
];

// 状态标签映射
const statusMap = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待审核' },
  published: { color: 'success', text: '已发布' },
  offline: { color: 'error', text: '已下线' }
};

const HotelEdit: React.FC = () => {
  const [dataSource, setDataSource] = useState<HotelData[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelData | null>(null);
  const [form] = Form.useForm();

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingHotel(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: HotelData) => {
    setEditingHotel(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 删除酒店
  const handleDelete = (id: string) => {
    setDataSource(dataSource.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  // 提交审核
  const handleSubmitReview = (record: HotelData) => {
    setDataSource(
      dataSource.map((item) =>
        item.id === record.id ? { ...item, status: 'pending' as const } : item
      )
    );
    message.success('已提交审核');
  };

  // 保存酒店信息
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingHotel) {
        // 编辑
        setDataSource(
          dataSource.map((item) => (item.id === editingHotel.id ? { ...item, ...values } : item))
        );
        message.success('修改成功');
      } else {
        // 新增
        const newHotel: HotelData = {
          ...values,
          id: Date.now().toString(),
          status: 'draft',
          createTime: new Date().toISOString().split('T')[0]
        };
        setDataSource([...dataSource, newHotel]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch {
      message.error('请检查表单信息');
    }
  };

  // 表格列定义
  const columns: ColumnsType<HotelData> = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 180
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 140
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      width: 100,
      render: (star: number) => `${star}星`
    },
    {
      title: '房间数',
      dataIndex: 'roomCount',
      key: 'roomCount',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      )
    },
    {
      title: '创建时间',
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => handleSubmitReview(record)}>
              提交审核
            </Button>
          )}
          <Popconfirm title="确定要删除此酒店吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            录入酒店
          </Button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'auto' }}>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingHotel ? '编辑酒店信息' : '录入酒店信息'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="酒店名称"
                rules={[{ required: true, message: '请输入酒店名称' }]}
              >
                <Input placeholder="请输入酒店名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="酒店地址"
            rules={[{ required: true, message: '请输入酒店地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="star"
                label="酒店星级"
                rules={[{ required: true, message: '请选择酒店星级' }]}
              >
                <Select placeholder="请选择星级">
                  <Select.Option value={1}>1星</Select.Option>
                  <Select.Option value={2}>2星</Select.Option>
                  <Select.Option value={3}>3星</Select.Option>
                  <Select.Option value={4}>4星</Select.Option>
                  <Select.Option value={5}>5星</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roomCount"
                label="房间数量"
                rules={[{ required: true, message: '请输入房间数量' }]}
              >
                <InputNumber min={1} placeholder="请输入房间数量" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="酒店描述">
            <Input.TextArea rows={4} placeholder="请输入酒店描述信息" />
          </Form.Item>

          <Form.Item label="酒店图片">
            <Upload listType="picture-card" maxCount={5}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
            <span style={{ color: '#999' }}>最多上传5张图片</span>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HotelEdit;
