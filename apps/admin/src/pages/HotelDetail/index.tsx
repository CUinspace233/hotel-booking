import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Form,
  Input,
  InputNumber,
  Descriptions,
  Row,
  Col,
  Modal,
  Tag,
  message,
  Tabs
} from 'antd';
import { ArrowLeftOutlined, HomeOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { hotelApi } from '@/api/hotel';
import type {
  HotelFormData,
  FrontendRoomDetail,
  FrontendPolicyDetail,
  FrontendFacilityDetail
} from '@/types';
import { HotelImagesCard, FacilitiesTab, PoliciesTab, RoomCard } from './components';

const { Title } = Typography;

const HotelDetail: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const mode = searchParams.get('mode');
  const isViewMode = mode === 'view';

  // 酒店数据状态
  const [hotelData, setHotelData] = useState<HotelFormData>({
    name: '',
    address: '',
    phone: '',
    starRating: 0,
    description: '',
    images: [],
    roomTypes: [],
    facilities: [],
    status: 'pending',
    policies: [],
    roomDetails: []
  });

  const [roomDetails, setRoomDetails] = useState<FrontendRoomDetail[]>([]);
  const [policyDetails, setPolicyDetails] = useState<FrontendPolicyDetail[]>([]);
  const [facilityDetails, setFacilityDetails] = useState<FrontendFacilityDetail[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statusConfig: Record<string, { text: string; color: string }> = {
    draft: { text: '草稿', color: 'default' },
    pending: { text: '审核中', color: 'processing' },
    approved: { text: '已通过', color: 'success' },
    rejected: { text: '已拒绝', color: 'error' },
    offline: { text: '已下线', color: 'default' },
    pending_update: { text: '二次审核中', color: 'processing' }
  };

  const canSubmitForReview = hotelData.status === 'draft' || hotelData.status === 'rejected';
  const canSubmitSecondaryReview = hotelData.status === 'approved';
  const canWithdrawReview = hotelData.status === 'pending' || hotelData.status === 'pending_update';

  // 从API获取酒店数据
  useEffect(() => {
    const fetchHotelData = async () => {
      if (!hotelId) return;

      setLoading(true);
      try {
        const formData = await hotelApi.getFormData(hotelId);
        setHotelData(formData);
        setRoomDetails(formData.roomDetails);
        setPolicyDetails(formData.policies);
        setFacilityDetails(formData.facilities || []);
        form.setFieldsValue(formData);
      } catch (error) {
        console.error('获取酒店数据失败:', error);
        message.error('获取酒店数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [hotelId, form]);

  const handleBack = () => {
    navigate('/hotel-edit');
  };

  // 统一保存所有数据（静默模式，不显示单独的成功提示）
  const saveAllData = async (): Promise<boolean> => {
    if (!hotelId) return false;

    try {
      // 1. 验证表单并保存基本信息
      const values = await form.validateFields();
      const formData: HotelFormData = {
        ...hotelData,
        ...values,
        roomDetails,
        policies: policyDetails
      };
      await hotelApi.saveFormData(hotelId, formData);
      setHotelData(formData);

      // 2. 保存房型信息（如果有房型数据）
      if (roomDetails.length > 0) {
        const emptyRooms = roomDetails.filter((room) => !room.roomName.trim());
        if (emptyRooms.length > 0) {
          message.warning('请填写所有房间的名称');
          return false;
        }
        await hotelApi.updateRooms(
          hotelId,
          roomDetails.map((room) => ({
            roomId: room.id.startsWith('new_') ? undefined : room.id,
            roomName: room.roomName,
            bedCount: room.bedCount,
            roomSize: room.roomSize,
            maxOccupancy: room.maxOccupancy,
            floor: room.floor,
            basePrice: room.basePrice ? Math.round(parseFloat(room.basePrice) * 100) : undefined
          }))
        );
      }

      // 3. 保存设施信息（如果有设施数据）
      if (facilityDetails.length > 0) {
        const emptyFacilities = facilityDetails.filter((f) => !f.facilityName.trim());
        if (emptyFacilities.length > 0) {
          message.warning('请填写所有设施的名称');
          return false;
        }
        const facilitiesData = facilityDetails.map((f) => ({
          facilityCode: f.facilityCode,
          facilityName: f.facilityName,
          facilityCategory: f.category,
          description: f.description || undefined
        }));
        await hotelApi.updateFacilities(hotelId, facilitiesData);
      }

      // 4. 保存政策信息（如果有政策数据）
      if (policyDetails.length > 0) {
        const emptyPolicies = policyDetails.filter((p) => !p.policyName.trim());
        if (emptyPolicies.length > 0) {
          message.warning('请填写所有政策的名称');
          return false;
        }
        await hotelApi.updatePolicies(
          hotelId,
          policyDetails.map((policy) => ({
            policyId: policy.id.startsWith('new_') ? undefined : policy.id,
            policyType: policy.policyType,
            policyName: policy.policyName,
            policyContent: policy.policyContent
          }))
        );
      }

      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      message.error('保存数据失败，请检查填写的内容');
      return false;
    }
  };

  const handleSubmitForReview = () => {
    if (!hotelId) return;

    Modal.confirm({
      title: '提交审核',
      content: '确定要提交该酒店进行审核吗？系统将自动保存所有修改内容后提交。',
      okText: '确认提交',
      cancelText: '取消',
      onOk: async () => {
        try {
          setSubmitting(true);
          // 先保存所有数据
          const saveSuccess = await saveAllData();
          if (!saveSuccess) {
            return;
          }
          // 再提交审核
          await hotelApi.updateStatus(hotelId, 'pending');
          message.success('数据已保存并提交审核');
          setHotelData((prev) => ({ ...prev, status: 'pending' }));
        } catch (error) {
          console.error('提交审核失败:', error);
          message.error('提交审核失败');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const handleSubmitSecondaryReview = () => {
    if (!hotelId) return;

    Modal.confirm({
      title: '提交二次审核',
      content:
        '您正在提交已发布酒店的修改内容进行审核。系统将自动保存所有修改内容后提交，审核通过前现网信息不会改变。',
      okText: '确认提交',
      cancelText: '取消',
      onOk: async () => {
        try {
          setSubmitting(true);
          // 先保存所有数据
          const saveSuccess = await saveAllData();
          if (!saveSuccess) {
            return;
          }
          // 再提交二次审核
          await hotelApi.submitSecondaryReview(hotelId);
          message.success('数据已保存并提交二次审核');
          setHotelData((prev) => ({ ...prev, status: 'pending_update' }));
        } catch (error) {
          console.error('提交二次审核失败:', error);
          message.error('提交二次审核失败');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const handleWithdrawReview = () => {
    if (!hotelId) return;

    const isSecondaryReview = hotelData.status === 'pending_update';
    Modal.confirm({
      title: '撤回审核',
      content: isSecondaryReview
        ? '确定要撤回二次审核吗？撤回后酒店状态将恢复为"已通过"，您可以继续修改后重新提交。'
        : '确定要撤回审核吗？撤回后酒店状态将恢复为"草稿"，您可以继续修改后重新提交。',
      okText: '确认撤回',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setSubmitting(true);
          await hotelApi.withdrawReview(hotelId);
          const newStatus = isSecondaryReview ? 'approved' : 'draft';
          message.success('审核已撤回');
          setHotelData((prev) => ({ ...prev, status: newStatus }));
        } catch (error) {
          console.error('撤回审核失败:', error);
          message.error('撤回审核失败');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // 房间管理
  const handleAddRoom = () => {
    const newRoom: FrontendRoomDetail = {
      id: `new_${Date.now()}`,
      roomName: '',
      bedCount: '',
      roomSize: '',
      maxOccupancy: '',
      floor: '',
      basePrice: ''
    };
    setRoomDetails([...roomDetails, newRoom]);
  };

  const handleRemoveRoom = (roomId: string) => {
    setRoomDetails(roomDetails.filter((room) => room.id !== roomId));
  };

  const handleRoomChange = (roomId: string, field: keyof FrontendRoomDetail, value: string) => {
    setRoomDetails(
      roomDetails.map((room) => (room.id === roomId ? { ...room, [field]: value } : room))
    );
  };

  // 保存酒店基本信息
  const handleSaveBasicInfo = async () => {
    if (!hotelId) return;

    try {
      const values = await form.validateFields();
      setSaving(true);

      const formData: HotelFormData = {
        ...hotelData,
        ...values,
        roomDetails,
        policies: policyDetails
      };

      await hotelApi.saveFormData(hotelId, formData);
      setHotelData(formData);
      message.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 保存房型信息
  const submitHotelRoomTypes = async () => {
    if (!hotelId) return;

    if (roomDetails.length === 0) {
      message.warning('请至少添加一个房间');
      return;
    }

    const emptyRooms = roomDetails.filter((room) => !room.roomName.trim());
    if (emptyRooms.length > 0) {
      message.warning('请填写所有房间的名称');
      return;
    }

    try {
      setSaving(true);
      await hotelApi.updateRooms(
        hotelId,
        roomDetails.map((room) => ({
          roomId: room.id.startsWith('new_') ? undefined : room.id,
          roomName: room.roomName,
          bedCount: room.bedCount,
          roomSize: room.roomSize,
          maxOccupancy: room.maxOccupancy,
          floor: room.floor,
          basePrice: room.basePrice ? Math.round(parseFloat(room.basePrice) * 100) : undefined
        }))
      );
      message.success('房型信息保存成功');

      const updatedData = await hotelApi.getFormData(hotelId);
      setRoomDetails(updatedData.roomDetails);
    } catch (error) {
      console.error('保存房型失败:', error);
      message.error('保存房型失败');
    } finally {
      setSaving(false);
    }
  };

  // 保存设施信息
  const submitHotelFacilities = async () => {
    if (!hotelId) return;

    const emptyFacilities = facilityDetails.filter((f) => !f.facilityName.trim());
    if (emptyFacilities.length > 0) {
      message.warning('请填写所有设施的名称');
      return;
    }

    try {
      setSaving(true);
      const facilitiesData = facilityDetails.map((f) => ({
        facilityCode: f.facilityCode,
        facilityName: f.facilityName,
        facilityCategory: f.category,
        description: f.description || undefined
      }));
      await hotelApi.updateFacilities(hotelId, facilitiesData);
      message.success('设施信息保存成功');
    } catch (error: unknown) {
      console.error('保存设施失败:', error);
      const errMsg =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : '保存设施失败';
      message.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // 保存政策信息
  const submitHotelPolicies = async () => {
    if (!hotelId) return;

    const emptyPolicies = policyDetails.filter((p) => !p.policyName.trim());
    if (emptyPolicies.length > 0) {
      message.warning('请填写所有政策的名称');
      return;
    }

    try {
      setSaving(true);
      await hotelApi.updatePolicies(
        hotelId,
        policyDetails.map((policy) => ({
          policyId: policy.id.startsWith('new_') ? undefined : policy.id,
          policyType: policy.policyType,
          policyName: policy.policyName,
          policyContent: policy.policyContent
        }))
      );
      message.success('政策信息保存成功');

      const updatedData = await hotelApi.getFormData(hotelId);
      setPolicyDetails(updatedData.policies);
    } catch (error) {
      console.error('保存政策失败:', error);
      message.error('保存政策失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* 页面头部 */}
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
          {hotelData.status && (
            <Tag color={statusConfig[hotelData.status]?.color || 'default'}>
              {statusConfig[hotelData.status]?.text || hotelData.status}
            </Tag>
          )}
        </Space>
        <Space>
          {!isViewMode && canSubmitForReview && (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmitForReview}
              loading={submitting}
            >
              提交审核
            </Button>
          )}
          {!isViewMode && canSubmitSecondaryReview && (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmitSecondaryReview}
              loading={submitting}
            >
              提交修改审核
            </Button>
          )}
          {!isViewMode && canWithdrawReview && (
            <Button danger onClick={handleWithdrawReview} loading={submitting}>
              撤回审核
            </Button>
          )}
          {isViewMode && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/hotel-detail/${hotelId}`)}
            >
              编辑
            </Button>
          )}
        </Space>
      </div>

      {/* 基础信息卡片 */}
      <Card title="酒店基本信息" loading={loading} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" initialValues={hotelData} size="large">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="酒店名称"
                name="name"
                rules={[{ required: true, message: '请输入酒店名称' }]}
              >
                <Input placeholder="请输入酒店名称" disabled={isViewMode} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="星级"
                name="starRating"
                rules={[{ required: true, message: '请选择酒店星级' }]}
              >
                <InputNumber
                  min={1}
                  max={5}
                  placeholder="请选择星级（1-5星）"
                  style={{ width: '100%' }}
                  disabled={isViewMode}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" disabled={isViewMode} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="酒店状态" name="status">
                <Input placeholder="酒店状态" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="酒店地址"
            name="address"
            rules={[{ required: true, message: '请输入酒店地址' }]}
          >
            <Input.TextArea placeholder="请输入详细地址" rows={2} disabled={isViewMode} />
          </Form.Item>

          <Form.Item label="酒店描述" name="description">
            <Input.TextArea
              placeholder="请输入酒店描述信息"
              rows={4}
              maxLength={500}
              showCount
              disabled={isViewMode}
            />
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          {!isViewMode ? (
            <Space>
              <Button onClick={handleBack}>取消</Button>
              <Button type="primary" loading={saving} onClick={handleSaveBasicInfo}>
                保存
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/hotel-detail/${hotelId}`)}
            >
              编辑
            </Button>
          )}
        </div>
      </Card>

      {/* 酒店图片卡片 */}
      {hotelId && <HotelImagesCard hotelId={hotelId} isViewMode={isViewMode} loading={loading} />}

      {/* 设施与政策卡片 */}
      <Card title="设施与政策" loading={loading} style={{ marginBottom: 24 }}>
        <Tabs
          defaultActiveKey="facilities"
          items={[
            {
              key: 'facilities',
              label: '设施服务',
              children: (
                <FacilitiesTab
                  facilities={facilityDetails}
                  isViewMode={isViewMode}
                  saving={saving}
                  onFacilitiesChange={setFacilityDetails}
                  onSave={submitHotelFacilities}
                />
              )
            },
            {
              key: 'policies',
              label: '酒店政策',
              children: (
                <PoliciesTab
                  policies={policyDetails}
                  isViewMode={isViewMode}
                  saving={saving}
                  onPoliciesChange={setPolicyDetails}
                  onSave={submitHotelPolicies}
                />
              )
            }
          ]}
        />
      </Card>

      {/* 酒店房型信息卡片 */}
      <Card title="酒店房型" loading={loading} style={{ marginBottom: 24 }}>
        {!isViewMode && (
          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" onClick={handleAddRoom} style={{ width: '100%' }}>
              + 添加房间
            </Button>
          </div>
        )}

        {roomDetails.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isViewMode={isViewMode}
            onRoomChange={handleRoomChange}
            onRemoveRoom={handleRemoveRoom}
          />
        ))}

        {!isViewMode && (
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button type="primary" loading={saving} onClick={submitHotelRoomTypes}>
              保存房型信息
            </Button>
          </div>
        )}
      </Card>

      {/* 查看模式下显示详细信息卡片 */}
      {isViewMode && (
        <Card title="酒店信息预览">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="酒店名称">{hotelData.name}</Descriptions.Item>
            <Descriptions.Item label="星级">{hotelData.starRating} 星级</Descriptions.Item>
            <Descriptions.Item label="联系电话">{hotelData.phone}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {hotelData.status === 'approved' ? '已审核' : '待审核'}
            </Descriptions.Item>
            <Descriptions.Item label="酒店地址" span={2}>
              {hotelData.address}
            </Descriptions.Item>
            <Descriptions.Item label="酒店描述" span={2}>
              {hotelData.description}
            </Descriptions.Item>
            <Descriptions.Item label="房型信息" span={2}>
              {hotelData.roomTypes && hotelData.roomTypes.length > 0
                ? hotelData.roomTypes.join(', ')
                : '暂无房型信息'}
            </Descriptions.Item>
            <Descriptions.Item label="房间详情" span={2}>
              {roomDetails.length > 0
                ? roomDetails.map((room, index) => (
                    <div key={room.id} style={{ marginBottom: '8px' }}>
                      <strong>房间{index + 1}:</strong> {room.roomName || '未命名房间'}
                      {room.bedCount && ` | 床数: ${room.bedCount}`}
                      {room.roomSize && ` | 面积: ${room.roomSize}`}
                      {room.maxOccupancy && ` | 可住: ${room.maxOccupancy}人`}
                      {room.floor && ` | 楼层: ${room.floor}`}
                    </div>
                  ))
                : '暂无房间详情'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default HotelDetail;
