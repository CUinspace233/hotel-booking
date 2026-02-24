import { useState, useEffect } from 'react';
import { Modal, Button, Space, Tag, Descriptions, Spin, Row, Col, Empty, Card } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { hotelApi } from '@/api/hotel';
import { POLICY_TYPE_OPTIONS, getCategoryLabel } from '@/constants';
import type { HotelProject, HotelFormData } from '@/types';

/** 状态标签映射 */
const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待审核' },
  pending_update: { color: 'processing', text: '二次审核' },
  approved: { color: 'success', text: '已通过' },
  rejected: { color: 'error', text: '已驳回' },
  offline: { color: 'default', text: '已下线' }
};

interface HotelDetailModalProps {
  open: boolean;
  hotel: HotelProject | null;
  onClose: () => void;
  onAudit?: (hotel: HotelProject) => void;
}

const HotelDetailModal: React.FC<HotelDetailModalProps> = ({ open, hotel, onClose, onAudit }) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<HotelFormData | null>(null);

  useEffect(() => {
    if (open && hotel) {
      loadDetail(hotel.hotelId);
    }
  }, [open, hotel]);

  const loadDetail = async (hotelId: string) => {
    setLoading(true);
    try {
      const formData = await hotelApi.getFormData(hotelId);
      setDetail(formData);
    } catch (error) {
      console.error('获取酒店详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDetail(null);
    onClose();
  };

  const handleGoAudit = () => {
    if (hotel && onAudit) {
      handleClose();
      onAudit(hotel);
    }
  };

  const getPolicyTypeName = (type: string) => {
    const option = POLICY_TYPE_OPTIONS.find((o) => o.value === type);
    return option ? option.label : type;
  };

  const showAuditButton =
    hotel && (hotel.status === 'pending' || hotel.status === 'pending_update') && onAudit;

  return (
    <Modal
      title={
        <Space>
          酒店详情
          {hotel && (
            <Tag color={statusMap[hotel.status]?.color || 'default'}>
              {statusMap[hotel.status]?.text || hotel.status}
            </Tag>
          )}
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={
        <Space>
          <Button onClick={handleClose}>关闭</Button>
          {showAuditButton && (
            <Button type="primary" icon={<AuditOutlined />} onClick={handleGoAudit}>
              去审核
            </Button>
          )}
        </Space>
      }
      width={900}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载中..." />
        </div>
      ) : detail ? (
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* 基本信息 */}
          <SectionTitle>基本信息</SectionTitle>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="酒店ID">{hotel?.hotelId}</Descriptions.Item>
            <Descriptions.Item label="酒店名称">{detail.name || '未命名'}</Descriptions.Item>
            <Descriptions.Item label="星级">
              {detail.starRating ? `${detail.starRating}星` : '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="开业年份">{detail.openingYear ?? '未设置'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{detail.phone || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              {detail.address || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {detail.description || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="提交人">{hotel?.creator}</Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {hotel?.submitTime
                ? new Date(hotel.submitTime).toLocaleString()
                : hotel?.createdAt
                  ? new Date(hotel.createdAt).toLocaleString()
                  : '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* 设施服务 */}
          <SectionTitle style={{ marginTop: 24 }}>设施服务</SectionTitle>
          {detail.facilities && detail.facilities.length > 0 ? (
            <FacilitiesDisplay facilities={detail.facilities} />
          ) : (
            <Empty description="暂无设施信息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}

          {/* 酒店政策 */}
          <SectionTitle style={{ marginTop: 24 }}>酒店政策</SectionTitle>
          {detail.policies && detail.policies.length > 0 ? (
            <Row gutter={[16, 16]}>
              {detail.policies.map((policy, index) => (
                <Col span={12} key={policy.id || index}>
                  <Card size="small" title={getPolicyTypeName(policy.policyType)}>
                    <div>
                      <strong>政策名称：</strong>
                      {policy.policyName}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <strong>政策内容：</strong>
                      {policy.policyContent || '未填写'}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无政策信息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}

          {/* 房型信息 */}
          <SectionTitle style={{ marginTop: 24 }}>房型信息</SectionTitle>
          {detail.roomDetails && detail.roomDetails.length > 0 ? (
            <Row gutter={[16, 16]}>
              {detail.roomDetails.map((room, index) => (
                <Col span={12} key={room.id || index}>
                  <Card size="small" title={room.roomName || '未命名房型'}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div>
                          <strong>床铺数量：</strong>
                          {room.bedCount || '未设置'}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <strong>房间大小：</strong>
                          {room.roomSize || '未设置'}
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <div>
                          <strong>入住人数：</strong>
                          {room.maxOccupancy || '未设置'}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <strong>所在楼层：</strong>
                          {room.floor || '未设置'}
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <div>
                          <strong>房间价格：</strong>
                          {room.basePrice ? `¥${room.basePrice}/晚` : '未设置'}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <strong>库存数量：</strong>
                          {room.totalCount != null && room.totalCount !== ''
                            ? `${room.totalCount}间`
                            : '未设置'}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无房型信息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      ) : (
        <Empty description="暂无数据" />
      )}
    </Modal>
  );
};

/** 区块标题组件 */
const SectionTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style
}) => (
  <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: 8, marginBottom: 16, ...style }}>
    {children}
  </h4>
);

/** 设施展示组件 */
interface FacilitiesDisplayProps {
  facilities: Array<{
    id: string;
    category: string;
    facilityCode: string;
    facilityName: string;
    description?: string;
  }>;
}

const FacilitiesDisplay: React.FC<FacilitiesDisplayProps> = ({ facilities }) => {
  const categories = [...new Set(facilities.map((f) => f.category))];

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>
            ▼ {getCategoryLabel(cat)}
          </div>
          <Space wrap size={[8, 8]}>
            {facilities
              .filter((f) => f.category === cat)
              .map((facility, index) => (
                <Tag key={facility.id || index} color="green">
                  {facility.facilityName}
                  {facility.description && (
                    <span style={{ color: '#666', marginLeft: 4 }}>({facility.description})</span>
                  )}
                </Tag>
              ))}
          </Space>
        </div>
      ))}
    </div>
  );
};

export default HotelDetailModal;
