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
  Select,
  Modal,
  Tag,
  message,
  Tabs,
  Image,
  Popconfirm
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  PictureOutlined
} from '@ant-design/icons';
import {
  hotelApi,
  POLICY_TYPE_OPTIONS,
  getPolicyNameByType,
  FACILITY_CATEGORIES,
  FACILITY_OPTIONS_BY_CATEGORY,
  isPresetCategory,
  getCategoryLabel
} from '@/api/hotel';
import type {
  HotelFormData,
  FrontendRoomDetail,
  FrontendPolicyDetail,
  FrontendFacilityDetail,
  PolicyType,
  FacilityCategory,
  RoomImage,
  HotelImage
} from '@/api/hotel';

const { Title } = Typography;

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
  const [form] = Form.useForm();

  // 获取模式参数：view-查看模式，其他-编辑模式
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

  // 房间详情状态
  const [roomDetails, setRoomDetails] = useState<FrontendRoomDetail[]>([]);

  // 政策详情状态
  const [policyDetails, setPolicyDetails] = useState<FrontendPolicyDetail[]>([]);

  // 设施详情状态
  const [facilityDetails, setFacilityDetails] = useState<FrontendFacilityDetail[]>([]);

  // 房型图片状态 - 以 roomId 为 key 存储每个房型的图片列表
  const [roomImages, setRoomImages] = useState<Record<string, RoomImage[]>>({});

  // 酒店图片状态
  const [hotelCoverImage, setHotelCoverImage] = useState<string>('');
  const [hotelImages, setHotelImages] = useState<HotelImage[]>([]);

  // 添加房型图片弹窗状态
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentRoomIdForImage, setCurrentRoomIdForImage] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  // 酒店图片弹窗状态
  const [hotelImageModalVisible, setHotelImageModalVisible] = useState(false);
  const [hotelImageModalType, setHotelImageModalType] = useState<'cover' | 'gallery'>('cover');
  const [newHotelImageUrl, setNewHotelImageUrl] = useState('');
  const [hotelImageLoading, setHotelImageLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 状态显示配置
  const statusConfig: Record<string, { text: string; color: string }> = {
    draft: { text: '草稿', color: 'default' },
    pending: { text: '审核中', color: 'processing' },
    approved: { text: '已通过', color: 'success' },
    rejected: { text: '已拒绝', color: 'error' },
    offline: { text: '已下线', color: 'default' },
    pending_update: { text: '二次审核中', color: 'processing' }
  };

  // 是否可以提交首次审核（草稿或已拒绝状态）
  const canSubmitForReview = hotelData.status === 'draft' || hotelData.status === 'rejected';

  // 是否可以提交二次审核（已通过状态）
  const canSubmitSecondaryReview = hotelData.status === 'approved';

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

  // 返回列表页
  const handleBack = () => {
    navigate('/hotel-edit');
  };

  // 提交首次审核
  const handleSubmitForReview = () => {
    if (!hotelId) return;

    Modal.confirm({
      title: '提交审核',
      content: '确定要提交该酒店进行审核吗？提交后将进入审核流程。',
      okText: '确认提交',
      cancelText: '取消',
      onOk: async () => {
        try {
          setSubmitting(true);
          await hotelApi.updateStatus(hotelId, 'pending');
          message.success('提交审核成功');
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

  // 提交二次审核（已发布酒店修改后重新提审）
  const handleSubmitSecondaryReview = () => {
    if (!hotelId) return;

    Modal.confirm({
      title: '提交二次审核',
      content: '您正在提交已发布酒店的修改内容进行审核。审核通过前，现网信息不会改变。确定提交吗？',
      okText: '确认提交',
      cancelText: '取消',
      onOk: async () => {
        try {
          setSubmitting(true);
          await hotelApi.submitSecondaryReview(hotelId);
          message.success('二次审核提交成功');
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

  // 添加新房间
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

  // 删除房间
  const handleRemoveRoom = (roomId: string) => {
    setRoomDetails(roomDetails.filter((room) => room.id !== roomId));
  };

  // 更新房间信息
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

  // ===================== 房型图片管理 =====================

  // 获取指定房型的图片
  const fetchRoomImages = async (roomId: string) => {
    if (!roomId || roomId.startsWith('new_')) return;
    try {
      const images = await hotelApi.getRoomImages(roomId);
      setRoomImages((prev) => ({ ...prev, [roomId]: images }));
    } catch (error) {
      console.error('获取房型图片失败:', error);
    }
  };

  // 打开添加图片弹窗
  const handleOpenImageModal = (roomId: string) => {
    if (roomId.startsWith('new_')) {
      message.warning('请先保存房型信息后再添加图片');
      return;
    }
    setCurrentRoomIdForImage(roomId);
    setNewImageUrl('');
    setImageModalVisible(true);
  };

  // 添加图片
  const handleAddRoomImage = async () => {
    if (!newImageUrl.trim()) {
      message.warning('请输入图片URL');
      return;
    }
    if (!currentRoomIdForImage) return;

    try {
      setImageLoading(true);
      await hotelApi.addRoomImages(currentRoomIdForImage, [{ imageUrl: newImageUrl.trim() }]);
      message.success('图片添加成功');
      setImageModalVisible(false);
      setNewImageUrl('');
      fetchRoomImages(currentRoomIdForImage);
    } catch (error) {
      console.error('添加图片失败:', error);
      message.error('添加图片失败');
    } finally {
      setImageLoading(false);
    }
  };

  // 删除图片
  const handleDeleteRoomImage = async (roomId: string, imageId: number) => {
    try {
      await hotelApi.deleteRoomImage(roomId, imageId);
      message.success('图片删除成功');
      fetchRoomImages(roomId);
    } catch (error) {
      console.error('删除图片失败:', error);
      message.error('删除图片失败');
    }
  };

  // 当房型详情加载完成后，获取每个已保存房型的图片
  useEffect(() => {
    roomDetails.forEach((room) => {
      if (!room.id.startsWith('new_') && !roomImages[room.id]) {
        fetchRoomImages(room.id);
      }
    });
  }, [roomDetails]);

  // ===================== 酒店图片管理 =====================

  // 获取酒店图片（主图和图集）
  const fetchHotelImages = async () => {
    if (!hotelId) return;
    try {
      const images = await hotelApi.getHotelImages(hotelId);
      setHotelImages(images);
    } catch (error) {
      console.error('获取酒店图片失败:', error);
    }
  };

  // 获取酒店主图
  const fetchHotelCoverImage = async () => {
    if (!hotelId) return;
    try {
      const detail = await hotelApi.getDetail(hotelId);
      setHotelCoverImage(detail.coverImage || '');
    } catch (error) {
      console.error('获取酒店主图失败:', error);
    }
  };

  // 加载酒店图片数据
  useEffect(() => {
    if (hotelId) {
      fetchHotelImages();
      fetchHotelCoverImage();
    }
  }, [hotelId]);

  // 打开酒店图片弹窗
  const handleOpenHotelImageModal = (type: 'cover' | 'gallery') => {
    setHotelImageModalType(type);
    setNewHotelImageUrl('');
    setHotelImageModalVisible(true);
  };

  // 添加/更新酒店图片
  const handleAddHotelImage = async () => {
    if (!newHotelImageUrl.trim()) {
      message.warning('请输入图片URL');
      return;
    }
    if (!hotelId) return;

    try {
      setHotelImageLoading(true);
      if (hotelImageModalType === 'cover') {
        await hotelApi.updateCoverImage(hotelId, newHotelImageUrl.trim());
        setHotelCoverImage(newHotelImageUrl.trim());
        message.success('主图设置成功');
      } else {
        await hotelApi.addHotelImages(hotelId, [{ imageUrl: newHotelImageUrl.trim() }]);
        message.success('图片添加成功');
        fetchHotelImages();
      }
      setHotelImageModalVisible(false);
      setNewHotelImageUrl('');
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    } finally {
      setHotelImageLoading(false);
    }
  };

  // 删除酒店图集图片
  const handleDeleteHotelImage = async (imageId: number) => {
    if (!hotelId) return;
    try {
      await hotelApi.deleteHotelImage(hotelId, imageId);
      message.success('图片删除成功');
      fetchHotelImages();
    } catch (error) {
      console.error('删除图片失败:', error);
      message.error('删除图片失败');
    }
  };

  // 清除酒店主图
  const handleClearCoverImage = async () => {
    if (!hotelId) return;
    try {
      await hotelApi.updateCoverImage(hotelId, '');
      setHotelCoverImage('');
      message.success('主图已清除');
    } catch (error) {
      console.error('清除主图失败:', error);
      message.error('清除主图失败');
    }
  };

  // 添加新政策
  const handleAddPolicy = () => {
    const newPolicy: FrontendPolicyDetail = {
      id: `new_${Date.now()}`,
      policyType: 'checkIn',
      policyName: '入住时间',
      policyContent: ''
    };
    setPolicyDetails([...policyDetails, newPolicy]);
  };

  // 删除政策
  const handleRemovePolicy = (policyId: string) => {
    setPolicyDetails(policyDetails.filter((policy) => policy.id !== policyId));
  };

  // 更新政策信息
  const handlePolicyChange = (
    policyId: string,
    field: keyof FrontendPolicyDetail,
    value: string
  ) => {
    setPolicyDetails(
      policyDetails.map((policy) => {
        if (policy.id !== policyId) return policy;

        if (field === 'policyType') {
          const newType = value as PolicyType;
          return {
            ...policy,
            policyType: newType,
            policyName: newType === 'other' ? '' : getPolicyNameByType(newType)
          };
        }

        return { ...policy, [field]: value };
      })
    );
  };

  // 获取已添加的分类列表（去重）
  const getSelectedCategories = (): string[] => {
    const categories = facilityDetails.map((f) => f.category);
    return [...new Set(categories)];
  };

  // 添加分类弹窗状态
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('');

  // 添加设施弹窗状态
  const [addFacilityModalVisible, setAddFacilityModalVisible] = useState(false);
  const [addFacilityCategory, setAddFacilityCategory] = useState<string>('');
  const [selectedPresetFacility, setSelectedPresetFacility] = useState<string>('');
  const [customFacilityName, setCustomFacilityName] = useState('');
  const [customFacilityDesc, setCustomFacilityDesc] = useState('');

  // 打开添加分类弹窗
  const handleOpenAddCategory = () => {
    setSelectedPresetCategory('');
    setCustomCategoryName('');
    setAddCategoryModalVisible(true);
  };

  // 确认添加分类
  const handleConfirmAddCategory = () => {
    let categoryValue = selectedPresetCategory;
    if (selectedPresetCategory === 'custom') {
      if (!customCategoryName.trim()) {
        message.warning('请输入自定义分类名称');
        return;
      }
      categoryValue = customCategoryName.trim();
    }
    if (!categoryValue) {
      message.warning('请选择或输入分类');
      return;
    }
    const existingCategories = getSelectedCategories();
    if (existingCategories.includes(categoryValue)) {
      message.warning('该分类已存在');
      return;
    }
    setAddCategoryModalVisible(false);
    setAddFacilityCategory(categoryValue);
    setAddFacilityModalVisible(true);
  };

  // 删除分类（删除该分类下所有设施）
  const handleDeleteCategory = (category: string) => {
    setFacilityDetails(facilityDetails.filter((f) => f.category !== category));
  };

  // 打开添加设施弹窗
  const handleOpenAddFacility = (category: string) => {
    setAddFacilityCategory(category);
    setSelectedPresetFacility('');
    setCustomFacilityName('');
    setCustomFacilityDesc('');
    setAddFacilityModalVisible(true);
  };

  // 确认添加设施
  const handleConfirmAddFacility = () => {
    let facilityCode = selectedPresetFacility;
    let facilityName = '';

    if (selectedPresetFacility === 'custom' || !isPresetCategory(addFacilityCategory)) {
      if (!customFacilityName.trim()) {
        message.warning('请输入设施名称');
        return;
      }
      facilityCode = `custom_${Date.now()}`;
      facilityName = customFacilityName.trim();
    } else {
      if (!selectedPresetFacility) {
        message.warning('请选择设施');
        return;
      }
      const options = FACILITY_OPTIONS_BY_CATEGORY[addFacilityCategory as FacilityCategory];
      const option = options?.find((o) => o.value === selectedPresetFacility);
      facilityName = option?.label || selectedPresetFacility;
    }

    const newFacility: FrontendFacilityDetail = {
      id: `new_${Date.now()}_${Math.random()}`,
      category: addFacilityCategory,
      facilityCode,
      facilityName,
      description: customFacilityDesc.trim() || undefined
    };
    setFacilityDetails([...facilityDetails, newFacility]);
    setAddFacilityModalVisible(false);
  };

  // 删除单个设施
  const handleDeleteFacility = (id: string) => {
    setFacilityDetails(facilityDetails.filter((f) => f.id !== id));
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
          {/* 首次提交审核（草稿/已拒绝状态） */}
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
          {/* 二次提交审核（已通过状态） */}
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
          {/* 审核中状态 */}
          {!isViewMode &&
            (hotelData.status === 'pending' || hotelData.status === 'pending_update') && (
              <Button disabled>
                {hotelData.status === 'pending_update' ? '修改审核中' : '审核中'}
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

        {/* 操作按钮 */}
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
      <Card title="酒店图片" loading={loading} style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          {/* 酒店主图 */}
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <label style={{ fontWeight: 500 }}>
                  <PictureOutlined style={{ marginRight: 8 }} />
                  酒店主图
                </label>
                {!isViewMode && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleOpenHotelImageModal('cover')}
                  >
                    {hotelCoverImage ? '更换' : '设置'}
                  </Button>
                )}
              </div>
              {hotelCoverImage ? (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '75%',
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    src={hotelCoverImage}
                    alt="酒店主图"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHALAIBB9o3lW0AAAW7SURBVHgB7d0xjuMwEETR3P+Szv/uzDEwwGBJypQp69Wr9AcYLlrp7s7MzDcCAoEAApkJfOVOgTMCCJyBAAIIBAAInMB5IAAAAmcggEBmAgpC5gS4HgGrAAgEAAgAgAAACACAAAJnIIAAAmcggEBmAkfG5W/v7vvr/T2/fvd9fz33bfP+/v59v5+39+PjeX/f3n+ep9/v9/09t0cAgQAACACAAAIIIIAAAmcggAACZyCAQGYCR8YlfS5+e/e/ffduu/PO51+/e/f93P7dvnz1rh/HcX//u/vv8/v9Pn9/v6/bI4AAAggggAACCCCAAAJnIIAAAmcggAACf0jgd/77ee/ef/d1fp/vuPv+s1/n+/19/Lz7vr/P0+/7fC7+/t0eAQQQQAABBBBAAAEEEDgDAQQQOAMBBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQOAPCez3O1//97d3799992677+e77/u89++/8u777e/9u++9vf/u+3k+Tu8/v+cIIIAAAggggAACCCCAAAJnIIAAAmcggEBmArc/H8ex3+3v7+f17fvd9+PnfXz8/u6/e7773v5+v3/f29/n/Pjr/vt+vs7bI4AAAggggAACCCCAAAIIIHAGAgggcAYCCCCAAH0="
                  />
                  {!isViewMode && (
                    <Popconfirm
                      title="确定清除主图吗？"
                      onConfirm={handleClearCoverImage}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(255,255,255,0.8)',
                          borderRadius: '50%'
                        }}
                      />
                    </Popconfirm>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    paddingTop: '75%',
                    position: 'relative',
                    border: '1px dashed #d9d9d9',
                    borderRadius: 8,
                    background: '#fafafa'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      color: '#999'
                    }}
                  >
                    <PictureOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                    <div>暂无主图</div>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                主图将作为酒店的封面展示
              </div>
            </div>
          </Col>

          {/* 酒店图集 */}
          <Col span={16}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <label style={{ fontWeight: 500 }}>
                  <PictureOutlined style={{ marginRight: 8 }} />
                  酒店图集 ({hotelImages.length} 张)
                </label>
                {!isViewMode && (
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenHotelImageModal('gallery')}
                  >
                    添加图片
                  </Button>
                )}
              </div>
              {hotelImages.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <Image.PreviewGroup>
                    {hotelImages.map((img) => (
                      <div
                        key={img.id}
                        style={{
                          position: 'relative',
                          width: 120,
                          height: 90,
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Image
                          src={img.imageUrl}
                          alt="酒店图片"
                          width={120}
                          height={90}
                          style={{ objectFit: 'cover' }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHALAIBB9o3lW0AAAW7SURBVHgB7d0xjuMwEETR3P+Szv/uzDEwwGBJypQp69Wr9AcYLlrp7s7MzDcCAoEAApkJfOVOgTMCCJyBAAIIBAAInMB5IAAAAmcggEBmAgpC5gS4HgGrAAgEAAgAgAAACACAAAJnIIAAAmcggEBmAkfG5W/v7vvr/T2/fvd9fz33bfP+/v59v5+39+PjeX/f3n+ep9/v9/09t0cAgQAACACAAAIIIIAAAmcggAACZyCAQGYCR8YlfS5+e/e/ffduu/PO51+/e/f93P7dvnz1rh/HcX//u/vv8/v9Pn9/v6/bI4AAAggggAACCCCAAAJnIIAAAmcggAACf0jgd/77ee/ef/d1fp/vuPv+s1/n+/19/Lz7vr/P0+/7fC7+/t0eAQQQQAABBBBAAAEEEDgDAQQQOAMBBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQOAPCez3O1//97d3799992677+e77/u89++/8u777e/9u++9vf/u+3k+Tu8/v+cIIIAAAggggAACCCCAAAJnIIAAAmcggEBmArc/H8ex3+3v7+f17fvd9+PnfXz8/u6/e7773v5+v3/f29/n/Pjr/vt+vs7bI4AAAggggAACCCCAAAIIIHAGAgggcAYCCCCAAH0="
                        />
                        {!isViewMode && (
                          <Popconfirm
                            title="确定删除这张图片吗？"
                            onConfirm={() => handleDeleteHotelImage(img.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '50%',
                                padding: 4,
                                minWidth: 'auto'
                              }}
                            />
                          </Popconfirm>
                        )}
                      </div>
                    ))}
                  </Image.PreviewGroup>
                </div>
              ) : (
                <div
                  style={{
                    color: '#999',
                    fontSize: 12,
                    textAlign: 'center',
                    padding: '32px 0',
                    border: '1px dashed #d9d9d9',
                    borderRadius: 8,
                    background: '#fafafa'
                  }}
                >
                  <PictureOutlined style={{ fontSize: 24, marginBottom: 8, display: 'block' }} />
                  暂无图集，点击"添加图片"按钮添加
                </div>
              )}
              <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                图集用于展示酒店的环境、设施等
              </div>
            </div>
          </Col>
        </Row>

        {/* 酒店图片弹窗 */}
        <Modal
          title={hotelImageModalType === 'cover' ? '设置酒店主图' : '添加酒店图片'}
          open={hotelImageModalVisible}
          onOk={handleAddHotelImage}
          onCancel={() => setHotelImageModalVisible(false)}
          confirmLoading={hotelImageLoading}
          okText={hotelImageModalType === 'cover' ? '设置' : '添加'}
          cancelText="取消"
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, color: '#666' }}>请输入图片URL地址：</div>
            <Input.TextArea
              placeholder="请输入图片URL，例如：https://example.com/image.jpg"
              value={newHotelImageUrl}
              onChange={(e) => setNewHotelImageUrl(e.target.value)}
              rows={3}
            />
          </div>
          {newHotelImageUrl && (
            <div>
              <div style={{ marginBottom: 8, color: '#666' }}>图片预览：</div>
              <Image
                src={newHotelImageUrl}
                alt="预览"
                width={200}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesALAIBB8A3FG0AAAX/SURBVHgB7d0JcxRVGEDhGAURcQNR3PdR3BX33Ve7HMvfyE9J6LnPt1HSM8nMdN97TyAQQggPAgIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggg8I8V2PcPO7+/yv7+5u97d/d+n0fPK4LQr/+52+/jfutP4Pj+YX8/AgIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAII/E8E9v4O53Fce3e//rT3Hzz+fvv8xf18fF/n/t1/37dff3r7v+n48rn3/L28fT+Pd/t++Pyh+/zx1/f2c9/x7fd9d/8JnPy++/y03+cd/3yf+r56fDy/9x0rAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQ+I8I7Pc7H0cvfnt4fy/v7Ovr+u/v+v2r7+/5rb7+Pva9+r7f7u/9+n3fe/t6f+ePP//2/Xw8vt/Xx9f38bF/90PQRQABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAIH/icB+v/NxfPXb/fv29fX6+/58t+/jzz//+ty9/t9+97d/7+3r/dzbr/fz/nq9P969F98TAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIPAPE/h/v/H/z4vb19Pz4/Pfe/u6v7+Pz9+92/d5P8/b+/Hx8ef79v3bfd8/tvf3+3z7ff+87z5+v+/3+9/fc0MAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAIH/q8BnEyGRJnXsJ54AAAAASUVORK5CYII="
              />
            </div>
          )}
        </Modal>
      </Card>

      {/* 设施与政策卡片 */}
      <Card title="设施与政策" loading={loading} style={{ marginBottom: 24 }}>
        <Tabs
          defaultActiveKey="facilities"
          items={[
            {
              key: 'facilities',
              label: '设施服务',
              children: (
                <div>
                  {/* 已添加的分类标签 */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8, color: '#666', fontWeight: 500 }}>
                      已添加分类：
                    </div>
                    <Space wrap size={[8, 8]}>
                      {getSelectedCategories().map((cat) => (
                        <Tag
                          key={cat}
                          color="blue"
                          closable={!isViewMode}
                          onClose={() => handleDeleteCategory(cat)}
                          style={{ padding: '4px 8px', fontSize: 14 }}
                        >
                          {getCategoryLabel(cat)}
                        </Tag>
                      ))}
                      {!isViewMode && (
                        <Tag
                          onClick={handleOpenAddCategory}
                          style={{
                            padding: '4px 8px',
                            fontSize: 14,
                            cursor: 'pointer',
                            borderStyle: 'dashed'
                          }}
                        >
                          <PlusOutlined /> 添加分类
                        </Tag>
                      )}
                    </Space>
                  </div>

                  {/* 按分类展示设施 */}
                  {getSelectedCategories().length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                      暂无设施，请点击"添加分类"按钮开始添加
                    </div>
                  ) : (
                    getSelectedCategories().map((cat) => (
                      <div key={cat} style={{ marginBottom: 24 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            marginBottom: 12,
                            color: '#333',
                            borderBottom: '1px solid #f0f0f0',
                            paddingBottom: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>▼ {getCategoryLabel(cat)}</span>
                        </div>
                        <Space wrap size={[8, 8]}>
                          {facilityDetails
                            .filter((f) => f.category === cat)
                            .map((facility) => (
                              <Tag
                                key={facility.id}
                                color="green"
                                closable={!isViewMode}
                                onClose={() => handleDeleteFacility(facility.id)}
                                style={{ padding: '4px 8px', fontSize: 14 }}
                              >
                                {facility.facilityName}
                                {facility.description && (
                                  <span style={{ color: '#999', marginLeft: 4 }}>
                                    ({facility.description})
                                  </span>
                                )}
                              </Tag>
                            ))}
                          {!isViewMode && (
                            <Tag
                              onClick={() => handleOpenAddFacility(cat)}
                              style={{
                                padding: '4px 8px',
                                fontSize: 14,
                                cursor: 'pointer',
                                borderStyle: 'dashed'
                              }}
                            >
                              <PlusOutlined /> 添加设施
                            </Tag>
                          )}
                        </Space>
                      </div>
                    ))
                  )}

                  {/* 保存按钮 */}
                  {!isViewMode && facilityDetails.length > 0 && (
                    <div style={{ textAlign: 'right', marginTop: 16 }}>
                      <Button type="primary" loading={saving} onClick={submitHotelFacilities}>
                        保存设施
                      </Button>
                    </div>
                  )}

                  {/* 添加分类弹窗 */}
                  <Modal
                    title="添加设施分类"
                    open={addCategoryModalVisible}
                    onOk={handleConfirmAddCategory}
                    onCancel={() => setAddCategoryModalVisible(false)}
                    okText="下一步"
                    cancelText="取消"
                  >
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8 }}>选择预设分类：</div>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="请选择分类"
                        value={selectedPresetCategory}
                        onChange={(v) => {
                          setSelectedPresetCategory(v);
                          if (v !== 'custom') setCustomCategoryName('');
                        }}
                        options={[
                          ...FACILITY_CATEGORIES.filter(
                            (c) => !getSelectedCategories().includes(c.value)
                          ).map((c) => ({ value: c.value, label: c.label })),
                          { value: 'custom', label: '其它设施（自定义）' }
                        ]}
                      />
                    </div>
                    {selectedPresetCategory === 'custom' && (
                      <div>
                        <div style={{ marginBottom: 8 }}>自定义分类名称：</div>
                        <Input
                          placeholder="请输入自定义分类名称"
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                        />
                      </div>
                    )}
                  </Modal>

                  {/* 添加设施弹窗 */}
                  <Modal
                    title={`添加${getCategoryLabel(addFacilityCategory)}设施`}
                    open={addFacilityModalVisible}
                    onOk={handleConfirmAddFacility}
                    onCancel={() => setAddFacilityModalVisible(false)}
                    okText="确定"
                    cancelText="取消"
                  >
                    {isPresetCategory(addFacilityCategory) ? (
                      <>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ marginBottom: 8 }}>选择设施：</div>
                          <Select
                            style={{ width: '100%' }}
                            placeholder="请选择设施"
                            value={selectedPresetFacility}
                            onChange={(v) => {
                              setSelectedPresetFacility(v);
                              if (v !== 'custom') setCustomFacilityName('');
                            }}
                            options={[
                              ...(
                                FACILITY_OPTIONS_BY_CATEGORY[
                                  addFacilityCategory as FacilityCategory
                                ] || []
                              )
                                .filter(
                                  (o) =>
                                    !facilityDetails.some(
                                      (f) =>
                                        f.category === addFacilityCategory &&
                                        f.facilityCode === o.value
                                    )
                                )
                                .map((o) => ({ value: o.value, label: o.label })),
                              { value: 'custom', label: '自定义设施' }
                            ]}
                          />
                        </div>
                        {selectedPresetFacility === 'custom' && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>设施名称：</div>
                            <Input
                              placeholder="请输入设施名称"
                              value={customFacilityName}
                              onChange={(e) => setCustomFacilityName(e.target.value)}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8 }}>设施名称：</div>
                        <Input
                          placeholder="请输入设施名称"
                          value={customFacilityName}
                          onChange={(e) => setCustomFacilityName(e.target.value)}
                        />
                      </div>
                    )}
                    <div>
                      <div style={{ marginBottom: 8 }}>设施描述（可选）：</div>
                      <Input.TextArea
                        placeholder="如营业时间、位置说明等"
                        value={customFacilityDesc}
                        onChange={(e) => setCustomFacilityDesc(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </Modal>
                </div>
              )
            },
            {
              key: 'policies',
              label: '酒店政策',
              children: (
                <div>
                  {/* 添加政策按钮 - 只在编辑模式下显示 */}
                  {!isViewMode && (
                    <div style={{ marginBottom: 16 }}>
                      <Button
                        type="dashed"
                        onClick={handleAddPolicy}
                        style={{ width: '100%' }}
                        icon={<PlusOutlined />}
                      >
                        添加政策
                      </Button>
                    </div>
                  )}

                  {/* 政策详情卡片列表 */}
                  {policyDetails.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                      暂无政策，请点击"添加政策"按钮添加
                    </div>
                  ) : (
                    policyDetails.map((policy) => (
                      <Card
                        key={policy.id}
                        size="small"
                        style={{ marginBottom: 12 }}
                        title="政策详情"
                        extra={
                          !isViewMode && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemovePolicy(policy.id)}
                            >
                              删除
                            </Button>
                          )
                        }
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <div style={{ marginBottom: 8, color: '#666' }}>政策类型</div>
                            <Select
                              style={{ width: '100%' }}
                              value={policy.policyType}
                              disabled={isViewMode}
                              onChange={(value) =>
                                handlePolicyChange(policy.id, 'policyType', value)
                              }
                              options={POLICY_TYPE_OPTIONS}
                            />
                          </Col>
                          <Col span={16}>
                            <div style={{ marginBottom: 8, color: '#666' }}>政策名称</div>
                            {policy.policyType === 'other' ? (
                              <Input
                                placeholder="请输入自定义政策名称"
                                value={policy.policyName}
                                disabled={isViewMode}
                                onChange={(e) =>
                                  handlePolicyChange(policy.id, 'policyName', e.target.value)
                                }
                              />
                            ) : (
                              <Input value={policy.policyName} disabled />
                            )}
                          </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 12 }}>
                          <Col span={24}>
                            <div style={{ marginBottom: 8, color: '#666' }}>政策内容</div>
                            <Input.TextArea
                              placeholder="请输入政策内容"
                              value={policy.policyContent}
                              disabled={isViewMode}
                              rows={2}
                              maxLength={500}
                              showCount
                              onChange={(e) =>
                                handlePolicyChange(policy.id, 'policyContent', e.target.value)
                              }
                            />
                          </Col>
                        </Row>
                      </Card>
                    ))
                  )}

                  {/* 保存政策按钮 */}
                  {!isViewMode && policyDetails.length > 0 && (
                    <div style={{ textAlign: 'right', marginTop: 16 }}>
                      <Button type="primary" loading={saving} onClick={submitHotelPolicies}>
                        保存政策
                      </Button>
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* 酒店房型信息卡片 */}
      <Card title="酒店房型" loading={loading} style={{ marginBottom: 24 }}>
        {/* 添加房间按钮 - 只在编辑模式下显示 */}
        {!isViewMode && (
          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" onClick={handleAddRoom} style={{ width: '100%' }}>
              + 添加房间
            </Button>
          </div>
        )}

        {/* 房间详情卡片列表 */}
        {roomDetails.map((room) => (
          <Card
            key={room.id}
            size="small"
            style={{ marginBottom: 12 }}
            title={`房间详情`}
            extra={
              !isViewMode && (
                <Button type="text" danger onClick={() => handleRemoveRoom(room.id)}>
                  删除
                </Button>
              )
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    房间名称
                  </label>
                  <Input
                    placeholder="请输入房间名称"
                    value={room.roomName}
                    onChange={(e) => handleRoomChange(room.id, 'roomName', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    床铺数量
                  </label>
                  <Input
                    placeholder="请输入床铺数量"
                    value={room.bedCount}
                    onChange={(e) => handleRoomChange(room.id, 'bedCount', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    房间大小
                  </label>
                  <Input
                    placeholder="请输入房间大小（如：30㎡）"
                    value={room.roomSize}
                    onChange={(e) => handleRoomChange(room.id, 'roomSize', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    入住人数
                  </label>
                  <Input
                    placeholder="请输入最多入住人数"
                    value={room.maxOccupancy}
                    onChange={(e) => handleRoomChange(room.id, 'maxOccupancy', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    所在楼层
                  </label>
                  <Input
                    placeholder="请输入所在楼层"
                    value={room.floor}
                    onChange={(e) => handleRoomChange(room.id, 'floor', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    房间价格（元/晚）
                  </label>
                  <Input
                    placeholder="请输入房间价格"
                    value={room.basePrice}
                    onChange={(e) => handleRoomChange(room.id, 'basePrice', e.target.value)}
                    disabled={isViewMode}
                    type="number"
                    min={0}
                  />
                </div>
              </Col>
            </Row>

            {/* 房型图片管理区域 */}
            <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <label style={{ fontWeight: 500 }}>
                  <PictureOutlined style={{ marginRight: 8 }} />
                  房型图片
                </label>
                {!isViewMode && (
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenImageModal(room.id)}
                    disabled={room.id.startsWith('new_')}
                  >
                    添加图片
                  </Button>
                )}
              </div>

              {room.id.startsWith('new_') ? (
                <div
                  style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: '16px 0' }}
                >
                  请先保存房型信息后再添加图片
                </div>
              ) : roomImages[room.id] && roomImages[room.id].length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <Image.PreviewGroup>
                    {roomImages[room.id].map((img) => (
                      <div
                        key={img.id}
                        style={{
                          position: 'relative',
                          width: 120,
                          height: 90,
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Image
                          src={img.imageUrl}
                          alt="房型图片"
                          width={120}
                          height={90}
                          style={{ objectFit: 'cover' }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesALAIBB8A3FG0AAAX/SURBVHgB7d0JcxRVGEDhGAURcQNR3PdR3BX33Ve7HMvfyE9J6LnPt1HSM8nMdN97TyAQQggPAgIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggg8I8V2PcPO7+/yv7+5u97d/d+n0fPK4LQr/+52+/jfutP4Pj+YX8/AgIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAII/E8E9v4O53Fce3e//rT3Hzz+fvv8xf18fF/n/t1/37dff3r7v+n48rn3/L28fT+Pd/t++Pyh+/zx1/f2c9/x7fd9d/8JnPy++/y03+cd/3yf+r56fDy/9x0rAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQ+I8I7Pc7H0cvfnt4fy/v7Ovr+u/v+v2r7+/5rb7+Pva9+r7f7u/9+n3fe/t6f+ePP//2/Xw8vt/Xx9f38bF/90PQRQABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAIH/icB+v/NxfPXb/fv29fX6+/58t+/jzz//+ty9/t9+97d/7+3r/dzbr/fz/nq9P969F98TAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIPAPE/h/v/H/z4vb19Pz4/Pfe/u6v7+Pz9+92/d5P8/b+/Hx8ef79v3bfd8/tvf3+3z7ff+87z5+v+/3+9/fc0MAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAIH/q8BnEyGRJnXsJ54AAAAASUVORK5CYII="
                        />
                        {!isViewMode && (
                          <Popconfirm
                            title="确定删除这张图片吗？"
                            onConfirm={() => handleDeleteRoomImage(room.id, img.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '50%',
                                padding: 4,
                                minWidth: 'auto'
                              }}
                            />
                          </Popconfirm>
                        )}
                      </div>
                    ))}
                  </Image.PreviewGroup>
                </div>
              ) : (
                <div
                  style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: '16px 0' }}
                >
                  暂无图片，点击"添加图片"按钮添加
                </div>
              )}
            </div>
          </Card>
        ))}

        {/* 添加图片弹窗 */}
        <Modal
          title="添加房型图片"
          open={imageModalVisible}
          onOk={handleAddRoomImage}
          onCancel={() => setImageModalVisible(false)}
          confirmLoading={imageLoading}
          okText="添加"
          cancelText="取消"
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, color: '#666' }}>请输入图片URL地址：</div>
            <Input.TextArea
              placeholder="请输入图片URL，例如：https://example.com/image.jpg"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              rows={3}
            />
          </div>
          {newImageUrl && (
            <div>
              <div style={{ marginBottom: 8, color: '#666' }}>图片预览：</div>
              <Image
                src={newImageUrl}
                alt="预览"
                width={200}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHALAIBB9o3lW0AAAW7SURBVHgB7d0xjuMwEETR3P+Szv/uzDEwwGBJypQp69Wr9AcYLlrp7s7MzDcCAoEAApkJfOVOgTMCCJyBAAIIBAAInMB5IAAAAmcggEBmAgpC5gS4HgGrAAgEAAgAgAAACACAAAJnIIAAAmcggEBmAkfG5W/v7vvr/T2/fvd9fz33bfP+/v59v5+39+PjeX/f3n+ep9/v9/09t0cAgQAACACAAAIIIIAAAmcggAACZyCAQGYCR8YlfS5+e/e/ffduu/PO51+/e/f93P7dvnz1rh/HcX//u/vv8/v9Pn9/v6/bI4AAAggggAACCCCAAAJnIIAAAmcggAACf0jgd/77ee/ef/d1fp/vuPv+s1/n+/19/Lz7vr/P0+/7fC7+/t0eAQQQQAABBBBAAAEEEDgDAQQQOAMBBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQOAPCez3O1//97d3799992677+e77/u89++/8u777e/9u++9vf/u+3k+Tu8/v+cIIIAAAggggAACCCCAAAJnIIAAAmcggEBmArc/H8ex3+3v7+f17fvd9+PnfXz8/u6/e7773v5+v3/f29/n/Pjr/vt+vs7bI4AAAggggAACCCCAAAIIIHAGAgggcAYCCCCAAH0="
              />
            </div>
          )}
        </Modal>

        {/* 房型保存按钮 - 只在编辑模式下显示 */}
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
