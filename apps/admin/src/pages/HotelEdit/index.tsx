import { useState, useEffect, useCallback } from 'react';
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
  Typography,
  Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';

import { hotelApi } from '@/api/hotel';
import type { HotelProject, HotelStatus, HotelType } from '@/types';
import { RpcError } from '@/utils/rpc';

const { Text } = Typography;

// 酒店类型映射
const hotelTypeMap: Record<string, string> = {
  business: '商务酒店',
  resort: '度假酒店',
  boutique: '精品酒店',
  budget: '经济酒店',
  apartment: '公寓式酒店',
  standard: '标准酒店',
  hostel: '青年旅舍'
};

// 状态标签映射
const statusMap: Record<HotelStatus, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '提审中' },
  pending_update: { color: 'processing', text: '修改提审中' },
  approved: { color: 'success', text: '审核通过' },
  rejected: { color: 'error', text: '审核驳回' },
  offline: { color: 'warning', text: '已下线' }
};

const HotelEdit: React.FC = () => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<HotelProject[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [form] = Form.useForm();

  // 格式化日期显示
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  // 表格列定义
  const columns: ColumnsType<HotelProject> = [
    {
      title: '酒店ID',
      dataIndex: 'hotelId',
      key: 'hotelId',
      width: 200,
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
      ellipsis: true,
      render: (name: string | null) => name || '-'
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      ellipsis: true
    },
    {
      title: '酒店类型',
      dataIndex: 'hotelType',
      key: 'hotelType',
      ellipsis: true,
      render: (type: string | null) => (type ? hotelTypeMap[type] || type : '-')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      render: (status: HotelStatus) => {
        const statusInfo = statusMap[status] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '创建日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      ellipsis: true,
      render: (date: string) => formatDate(date)
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small" style={{ whiteSpace: 'nowrap' }}>
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

  // 获取酒店列表
  const fetchHotelList = useCallback(async (page = 1, pageSize = 10) => {
    setTableLoading(true);
    try {
      const result = await hotelApi.getList({ page, pageSize });
      setDataSource(result.list);
      setPagination({
        current: result.pagination.page,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total
      });
    } catch (error) {
      console.error('获取酒店列表失败:', error);
      if (error instanceof RpcError) {
        message.error(error.message || '获取酒店列表失败');
      } else {
        message.error('获取酒店列表失败，请检查网络连接');
      }
    } finally {
      setTableLoading(false);
    }
  }, []);

  // 初始化加载数据
  useEffect(() => {
    fetchHotelList();
  }, [fetchHotelList]);

  // 处理分页变化
  const handleTableChange = (paginationConfig: { current?: number; pageSize?: number }) => {
    fetchHotelList(paginationConfig.current || 1, paginationConfig.pageSize || 10);
  };

  // 刷新列表
  const handleRefresh = () => {
    fetchHotelList(pagination.current, pagination.pageSize);
  };

  // 打开新建弹窗
  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  // 跳转到详情编辑页面
  const handleEditDetail = (record: HotelProject) => {
    navigate(`/hotel-detail/${record.hotelId}`);
  };

  // 查看详情
  const handleViewDetail = (record: HotelProject) => {
    navigate(`/hotel-detail/${record.hotelId}?mode=view`);
  };

  // 删除酒店
  const handleDelete = async (hotelId: string) => {
    try {
      await hotelApi.delete(hotelId);
      message.success('删除成功');
      // 刷新列表
      fetchHotelList(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('删除酒店失败:', error);
      if (error instanceof RpcError) {
        message.error(error.message || '删除失败');
      } else {
        message.error('删除失败，请稍后重试');
      }
    }
  };

  // 提交审核
  const handleSubmitReview = async (record: HotelProject) => {
    try {
      await hotelApi.submitReview(record.hotelId);
      message.success('已提交审核');
      // 刷新列表
      fetchHotelList(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('提交审核失败:', error);
      if (error instanceof RpcError) {
        message.error(error.message || '提交审核失败');
      } else {
        message.error('提交审核失败，请稍后重试');
      }
    }
  };

  // 保存新建酒店基础信息
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await hotelApi.create({
        name: values.name,
        hotelType: values.hotelType as HotelType
      });

      message.success('酒店创建成功，请点击编辑完善详细信息');
      setModalVisible(false);
      // 刷新列表，跳到第一页查看新创建的记录
      fetchHotelList(1, pagination.pageSize);
    } catch (error) {
      console.error('创建酒店失败:', error);
      if (error instanceof RpcError) {
        message.error(error.message || '创建失败');
      } else if (error && typeof error === 'object' && 'errorFields' in error) {
        // 表单验证错误
        message.error('请检查表单信息');
      } else {
        message.error('创建失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: 24, flexShrink: 0 }}>
        <HomeOutlined style={{ marginRight: 8 }} />
        酒店信息管理
      </h2>

      <Card style={{ width: '100%' }}>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建酒店
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={tableLoading}>
              刷新
            </Button>
          </Space>
          <Text type="secondary">共 {pagination.total} 条记录</Text>
        </div>

        <Spin spinning={tableLoading}>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="hotelId"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            style={{ width: '100%' }}
          />
        </Spin>
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
        confirmLoading={loading}
        okButtonProps={{ disabled: loading }}
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
