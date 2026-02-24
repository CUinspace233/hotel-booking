import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  message,
  Tag,
  Input,
  Form,
  Descriptions,
  Select,
  Popconfirm
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  AuditOutlined,
  ReloadOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { hotelApi } from '@/api/hotel';
import type { HotelProject, HotelStatus } from '@/types';
import HotelDetailModal from './HotelDetailModal';

// 状态标签映射
const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待审核' },
  pending_update: { color: 'processing', text: '二次审核' },
  approved: { color: 'success', text: '已通过' },
  rejected: { color: 'error', text: '已驳回' },
  offline: { color: 'default', text: '已下线' }
};

// 筛选状态选项
const filterStatusOptions = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'offline', label: '已下线' },
  { value: 'rejected', label: '已驳回' }
];

const HotelAudit: React.FC = () => {
  const [dataSource, setDataSource] = useState<HotelProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [auditVisible, setAuditVisible] = useState(false);
  const [offlineVisible, setOfflineVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<HotelProject | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<HotelStatus | 'pending'>('pending');
  const [form] = Form.useForm();
  const [offlineForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 加载酒店列表
  const loadHotels = useCallback(async () => {
    setLoading(true);
    try {
      // 如果筛选待审核，需要合并首次审核和二次审核
      if (filterStatus === 'pending') {
        const [pendingResult, pendingUpdateResult] = await Promise.all([
          hotelApi.getList({
            status: 'pending',
            page: pagination.current,
            pageSize: pagination.pageSize,
            keyword: searchKeyword || undefined
          }),
          hotelApi.getList({
            status: 'pending_update',
            page: pagination.current,
            pageSize: pagination.pageSize,
            keyword: searchKeyword || undefined
          })
        ]);

        const combinedList = [...pendingResult.list, ...pendingUpdateResult.list].sort((a, b) => {
          const timeA = a.submitTime || a.createdAt;
          const timeB = b.submitTime || b.createdAt;
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });

        setDataSource(combinedList);
        setPagination((prev) => ({
          ...prev,
          total: pendingResult.pagination.total + pendingUpdateResult.pagination.total
        }));
      } else {
        const result = await hotelApi.getList({
          status: filterStatus,
          page: pagination.current,
          pageSize: pagination.pageSize,
          keyword: searchKeyword || undefined
        });

        setDataSource(result.list);
        setPagination((prev) => ({
          ...prev,
          total: result.pagination.total
        }));
      }
    } catch (error) {
      console.error('获取酒店列表失败:', error);
      message.error('获取酒店列表失败');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, searchKeyword, filterStatus]);

  // 初始加载
  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  // 查看详情
  const handleViewDetail = (record: HotelProject) => {
    setCurrentHotel(record);
    setDetailVisible(true);
  };

  // 打开审核弹窗
  const handleOpenAudit = (record: HotelProject) => {
    setCurrentHotel(record);
    form.resetFields();
    setAuditVisible(true);
  };

  // 审核通过
  const handleAuditPass = async () => {
    if (!currentHotel) return;

    try {
      // 对于二次审核的酒店，需要发布草稿
      if (currentHotel.status === 'pending_update') {
        await hotelApi.publishDraft(currentHotel.hotelId);
        message.success('审核通过，修改已发布');
      } else {
        // 首次审核通过后也需要发布草稿
        await hotelApi.publishDraft(currentHotel.hotelId);
        message.success('审核通过');
      }
      setAuditVisible(false);
      loadHotels();
    } catch (error) {
      console.error('审核失败:', error);
      message.error('审核失败');
    }
  };

  // 审核驳回
  const handleAuditReject = async () => {
    if (!currentHotel) return;
    const values = await form.validateFields();
    if (!values.remark) {
      message.warning('驳回时请填写原因');
      return;
    }

    try {
      await hotelApi.updateStatus(currentHotel.hotelId, 'rejected');
      message.success('已驳回');
      setAuditVisible(false);
      loadHotels();
    } catch (error) {
      console.error('驳回失败:', error);
      message.error('驳回失败');
    }
  };

  // 打开下线弹窗
  const handleOpenOffline = (record: HotelProject) => {
    setCurrentHotel(record);
    offlineForm.resetFields();
    setOfflineVisible(true);
  };

  // 确认下线
  const handleConfirmOffline = async () => {
    if (!currentHotel) return;
    const values = await offlineForm.validateFields();

    try {
      await hotelApi.setOffline(currentHotel.hotelId, values.reason);
      message.success('下线成功');
      setOfflineVisible(false);
      loadHotels();
    } catch (error) {
      console.error('下线失败:', error);
      message.error('下线失败');
    }
  };

  // 恢复上线
  const handleSetOnline = async (record: HotelProject) => {
    try {
      await hotelApi.setOnline(record.hotelId);
      message.success('恢复上线成功');
      loadHotels();
    } catch (error) {
      console.error('恢复上线失败:', error);
      message.error('恢复上线失败');
    }
  };

  // 搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 状态筛选变化
  const handleStatusChange = (value: HotelStatus | 'pending') => {
    setFilterStatus(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 分页变化
  const handleTableChange = (paginationInfo: { current?: number; pageSize?: number }) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationInfo.current || 1,
      pageSize: paginationInfo.pageSize || 10
    }));
  };

  // 表格列定义
  const columns: ColumnsType<HotelProject> = [
    {
      title: '酒店ID',
      dataIndex: 'hotelId',
      key: 'hotelId',
      width: 160
    },
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string | null) => name || '未命名'
    },
    {
      title: '提交人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 170,
      render: (time: string | null, record: HotelProject) => {
        const displayTime = time || record.createdAt;
        return displayTime ? new Date(displayTime).toLocaleString() : '-';
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'default'}>{statusMap[status]?.text || status}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
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
          {/* 待审核状态显示审核按钮 */}
          {(record.status === 'pending' || record.status === 'pending_update') && (
            <Button
              type="link"
              size="small"
              icon={<AuditOutlined />}
              onClick={() => handleOpenAudit(record)}
            >
              审核
            </Button>
          )}
          {/* 已通过状态显示下线按钮 */}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleOpenOffline(record)}
            >
              下线
            </Button>
          )}
          {/* 已下线状态显示恢复上线按钮 */}
          {record.status === 'offline' && (
            <Popconfirm
              title="确认恢复上线"
              description="确定要恢复该酒店上线吗？"
              onConfirm={() => handleSetOnline(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
                style={{ color: '#52c41a' }}
              >
                恢复上线
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
        <AuditOutlined style={{ marginRight: 8 }} />
        酒店审核管理
      </h2>

      <Card>
        {/* 筛选区域 */}
        <Space style={{ marginBottom: 16 }}>
          <Select
            value={filterStatus}
            onChange={handleStatusChange}
            style={{ width: 120 }}
            options={filterStatusOptions}
          />
          <Input.Search
            placeholder="搜索酒店名称"
            allowClear
            style={{ width: 240 }}
            onSearch={handleSearch}
          />
          <Button icon={<ReloadOutlined />} onClick={loadHotels}>
            刷新
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="hotelId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 详情弹窗 */}
      <HotelDetailModal
        open={detailVisible}
        hotel={currentHotel}
        onClose={() => setDetailVisible(false)}
        onAudit={handleOpenAudit}
      />

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
              <Descriptions.Item label="酒店ID">{currentHotel.hotelId}</Descriptions.Item>
              <Descriptions.Item label="酒店名称">
                {currentHotel.name || '未命名'}
              </Descriptions.Item>
              <Descriptions.Item label="提交人">{currentHotel.creator}</Descriptions.Item>
            </Descriptions>
            <Form form={form} layout="vertical">
              <Form.Item name="remark" label="审核备注">
                <Input.TextArea rows={3} placeholder="请输入审核备注（驳回时必填）" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* 下线弹窗 */}
      <Modal
        title="酒店下线"
        open={offlineVisible}
        onCancel={() => setOfflineVisible(false)}
        onOk={handleConfirmOffline}
        okText="确认下线"
        okButtonProps={{ danger: true }}
        width={500}
      >
        {currentHotel && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="酒店ID">{currentHotel.hotelId}</Descriptions.Item>
              <Descriptions.Item label="酒店名称">
                {currentHotel.name || '未命名'}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color="success">已通过</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Form form={offlineForm} layout="vertical">
              <Form.Item name="reason" label="下线原因">
                <Input.TextArea rows={3} placeholder="请输入下线原因（可选）" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default HotelAudit;
