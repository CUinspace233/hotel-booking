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
  Tabs
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined
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
  FacilityCategory
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
          </Card>
        ))}

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
