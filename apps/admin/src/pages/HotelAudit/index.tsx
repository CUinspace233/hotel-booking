import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  message,
  Tag,
  Input,
  Select,
  Form,
  Descriptions
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  AuditOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

// 酒店审核数据类型
interface HotelAuditData {
  id: string;
  name: string;
  address: string;
  phone: string;
  star: number;
  roomCount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'offline';
  submitter: string;
  submitTime: string;
  auditTime?: string;
  auditor?: string;
  auditRemark?: string;
}

// 模拟数据
const mockData: HotelAuditData[] = [
  {
    id: '1',
    name: '待审核酒店A',
    address: '北京市海淀区xxx路xxx号',
    phone: '010-11112222',
    star: 5,
    roomCount: 180,
    description: '高端商务酒店，设施齐全',
    status: 'pending',
    submitter: '张三',
    submitTime: '2024-01-18 10:30:00'
  },
  {
    id: '2',
    name: '已发布酒店B',
    address: '上海市静安区xxx路xxx号',
    phone: '021-33334444',
    star: 4,
    roomCount: 120,
    description: '精品商务酒店',
    status: 'published',
    submitter: '李四',
    submitTime: '2024-01-15 14:20:00',
    auditTime: '2024-01-16 09:00:00',
    auditor: '管理员',
    auditRemark: '信息完整，符合发布标准'
  },
  {
    id: '3',
    name: '已驳回酒店C',
    address: '广州市天河区xxx路xxx号',
    phone: '020-55556666',
    star: 3,
    roomCount: 80,
    description: '经济型酒店',
    status: 'rejected',
    submitter: '王五',
    submitTime: '2024-01-17 16:45:00',
    auditTime: '2024-01-18 11:30:00',
    auditor: '管理员',
    auditRemark: '酒店图片缺失，请补充后重新提交'
  }
];

// 状态标签映射
const statusMap = {
  pending: { color: 'processing', text: '待审核' },
  approved: { color: 'success', text: '审核通过' },
  rejected: { color: 'error', text: '已驳回' },
  published: { color: 'green', text: '已发布' },
  offline: { color: 'default', text: '已下线' }
};

const HotelAudit: React.FC = () => {
  const [dataSource, setDataSource] = useState<HotelAuditData[]>(mockData);
  const [detailVisible, setDetailVisible] = useState(false);
  const [auditVisible, setAuditVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<HotelAuditData | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();

  // 查看详情
  const handleViewDetail = (record: HotelAuditData) => {
    setCurrentHotel(record);
    setDetailVisible(true);
  };

  // 打开审核弹窗
  const handleOpenAudit = (record: HotelAuditData) => {
    setCurrentHotel(record);
    form.resetFields();
    setAuditVisible(true);
  };

  // 审核通过
  const handleAuditPass = async () => {
    if (!currentHotel) return;
    const values = await form.validateFields();
    setDataSource(
      dataSource.map((item) =>
        item.id === currentHotel.id
          ? {
              ...item,
              status: 'approved' as const,
              auditTime: new Date().toLocaleString(),
              auditor: '管理员',
              auditRemark: values.remark || '审核通过'
            }
          : item
      )
    );
    message.success('审核通过');
    setAuditVisible(false);
  };

  // 审核驳回
  const handleAuditReject = async () => {
    if (!currentHotel) return;
    const values = await form.validateFields();
    if (!values.remark) {
      message.warning('驳回时请填写原因');
      return;
    }
    setDataSource(
      dataSource.map((item) =>
        item.id === currentHotel.id
          ? {
              ...item,
              status: 'rejected' as const,
              auditTime: new Date().toLocaleString(),
              auditor: '管理员',
              auditRemark: values.remark
            }
          : item
      )
    );
    message.success('已驳回');
    setAuditVisible(false);
  };

  // 发布酒店
  const handlePublish = (record: HotelAuditData) => {
    setDataSource(
      dataSource.map((item) =>
        item.id === record.id ? { ...item, status: 'published' as const } : item
      )
    );
    message.success('发布成功');
  };

  // 下线酒店
  const handleOffline = (record: HotelAuditData) => {
    setDataSource(
      dataSource.map((item) =>
        item.id === record.id ? { ...item, status: 'offline' as const } : item
      )
    );
    message.success('已下线');
  };

  // 重新上线
  const handleOnline = (record: HotelAuditData) => {
    setDataSource(
      dataSource.map((item) =>
        item.id === record.id ? { ...item, status: 'published' as const } : item
      )
    );
    message.success('已重新上线');
  };

  // 过滤数据
  const filteredData = dataSource.filter((item) => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const keywordMatch =
      !searchKeyword || item.name.includes(searchKeyword) || item.address.includes(searchKeyword);
    return statusMatch && keywordMatch;
  });

  // 表格列定义
  const columns: ColumnsType<HotelAuditData> = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 160
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      width: 80,
      render: (star: number) => `${star}星`
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
      key: 'submitter',
      width: 100
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 170
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
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<AuditOutlined />}
              onClick={() => handleOpenAudit(record)}
            >
              审核
            </Button>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handlePublish(record)}
            >
              发布
            </Button>
          )}
          {record.status === 'published' && (
            <Button
              type="link"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleOffline(record)}
            >
              下线
            </Button>
          )}
          {record.status === 'offline' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleOnline(record)}
            >
              上线
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <AuditOutlined style={{ marginRight: 8 }} />
        酒店审核管理
      </h2>

      <Card>
        {/* 筛选区域 */}
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索酒店名称/地址"
            allowClear
            style={{ width: 240 }}
            onSearch={setSearchKeyword}
          />
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 140 }}>
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="pending">待审核</Select.Option>
            <Select.Option value="approved">审核通过</Select.Option>
            <Select.Option value="rejected">已驳回</Select.Option>
            <Select.Option value="published">已发布</Select.Option>
            <Select.Option value="offline">已下线</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="酒店详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>关闭</Button>}
        width={700}
      >
        {currentHotel && (
          <Descriptions bordered column={2} style={{ marginTop: 16 }}>
            <Descriptions.Item label="酒店名称">{currentHotel.name}</Descriptions.Item>
            <Descriptions.Item label="星级">{currentHotel.star}星</Descriptions.Item>
            <Descriptions.Item label="联系电话">{currentHotel.phone}</Descriptions.Item>
            <Descriptions.Item label="房间数量">{currentHotel.roomCount}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              {currentHotel.address}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {currentHotel.description}
            </Descriptions.Item>
            <Descriptions.Item label="提交人">{currentHotel.submitter}</Descriptions.Item>
            <Descriptions.Item label="提交时间">{currentHotel.submitTime}</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={statusMap[currentHotel.status].color}>
                {statusMap[currentHotel.status].text}
              </Tag>
            </Descriptions.Item>
            {currentHotel.auditor && (
              <Descriptions.Item label="审核人">{currentHotel.auditor}</Descriptions.Item>
            )}
            {currentHotel.auditTime && (
              <Descriptions.Item label="审核时间" span={2}>
                {currentHotel.auditTime}
              </Descriptions.Item>
            )}
            {currentHotel.auditRemark && (
              <Descriptions.Item label="审核备注" span={2}>
                {currentHotel.auditRemark}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 审核弹窗 */}
      <Modal
        title="酒店审核"
        open={auditVisible}
        onCancel={() => setAuditVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setAuditVisible(false)}>取消</Button>
            <Button danger icon={<CloseCircleOutlined />} onClick={handleAuditReject}>
              驳回
            </Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleAuditPass}>
              通过
            </Button>
          </Space>
        }
        width={500}
      >
        {currentHotel && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="酒店名称">{currentHotel.name}</Descriptions.Item>
              <Descriptions.Item label="酒店地址">{currentHotel.address}</Descriptions.Item>
              <Descriptions.Item label="提交人">{currentHotel.submitter}</Descriptions.Item>
            </Descriptions>
            <Form form={form} layout="vertical">
              <Form.Item name="remark" label="审核备注">
                <Input.TextArea rows={3} placeholder="请输入审核备注（驳回时必填）" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default HotelAudit;
