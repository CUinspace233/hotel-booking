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
  Col
} from 'antd';
import { ArrowLeftOutlined, HomeOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface RoomDetail {
  id: string;
  roomName: string;
  bedCount: string;
  roomSize: string;
  maxOccupancy: string;
  floor: string;
}

interface HotelFormData {
  name: string;
  address: string;
  phone: string;
  starRating: number;
  description: string;
  images: string[];
  roomTypes: string[];
  facilities: string[];
  status: string;
  facilityPolicies: {
    checkInTime: string;
    checkOutTime: string;
    petPolicy: string;
    cancellationPolicy: string;
    otherPolicies: string;
  };
  roomDetails: RoomDetail[];
}

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
    facilityPolicies: {
      checkInTime: '',
      checkOutTime: '',
      petPolicy: '',
      cancellationPolicy: '',
      otherPolicies: ''
    },
    roomDetails: []
  });

  // 房间详情状态
  const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);

  const [loading, setLoading] = useState(false);

  // 模拟数据获取
  useEffect(() => {
    const fetchHotelData = async () => {
      setLoading(true);
      try {
        // 这里后续会替换为实际的API调用
        // 现在使用模拟数据
        const mockData = {
          name: '上海中心大酒店',
          address: '上海市浦东新区世纪大道100号',
          phone: '021-12345678',
          starRating: 5,
          description:
            '这是一家五星级豪华酒店，位于上海的中心地带，交通便利，设施完善。酒店拥有多种房型，配备先进的设施和服务，为客人提供舒适的住宿体验。',
          images: [],
          roomTypes: [],
          facilities: ['wifi', 'parking', 'restaurant'],
          status: 'approved',
          facilityPolicies: {
            checkInTime: '15:00',
            checkOutTime: '12:00',
            petPolicy: '不允许携带宠物',
            cancellationPolicy: '入住前24小时可免费取消',
            otherPolicies: ''
          }
        };

        setTimeout(() => {
          setHotelData({ ...mockData, roomDetails: [] } as HotelFormData);
          form.setFieldsValue(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('获取酒店数据失败:', error);
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchHotelData();
    }
  }, [hotelId, form]);

  // 返回列表页
  const handleBack = () => {
    navigate('/hotel-edit');
  };

  // 添加新房间
  const handleAddRoom = () => {
    const newRoom: RoomDetail = {
      id: Date.now().toString(),
      roomName: '',
      bedCount: '',
      roomSize: '',
      maxOccupancy: '',
      floor: ''
    };
    setRoomDetails([...roomDetails, newRoom]);
  };

  // 删除房间
  const handleRemoveRoom = (roomId: string) => {
    setRoomDetails(roomDetails.filter((room) => room.id !== roomId));
  };

  // 更新房间信息
  const handleRoomChange = (roomId: string, field: keyof RoomDetail, value: string) => {
    setRoomDetails(
      roomDetails.map((room) => (room.id === roomId ? { ...room, [field]: value } : room))
    );
  };

  // 提交酒店房型信息（占位方法，后续对接后端使用）
  const submitHotelRoomTypes = () => {
    // TODO: 实现房型信息提交逻辑
    // 这个方法将在后续对接后端API时实现
    console.log('准备提交房型信息:', {
      roomTypes: hotelData.roomTypes,
      roomDetails: roomDetails
    });

    // 这里可以添加表单验证逻辑
    if (!hotelData.roomTypes || hotelData.roomTypes.length === 0) {
      console.warn('房型信息为空');
      return;
    }

    if (roomDetails.length === 0) {
      console.warn('房间详情为空');
      return;
    }

    // 模拟提交成功
    console.log('房型信息验证通过，准备提交到后端...');
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
                <Input
                  placeholder="请输入酒店名称"
                  disabled={!isViewMode} // 只在编辑模式下可编辑
                  readOnly={isViewMode} // 查看模式下只读
                />
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
                  disabled={!isViewMode} // 只在编辑模式下可编辑
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
                <Input
                  placeholder="请输入联系电话"
                  disabled={!isViewMode} // 只在编辑模式下可编辑
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="酒店状态" name="status">
                <Input
                  placeholder="酒店状态"
                  disabled // 状态字段始终只读
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="酒店地址"
            name="address"
            rules={[{ required: true, message: '请输入酒店地址' }]}
          >
            <Input.TextArea
              placeholder="请输入详细地址"
              rows={2}
              disabled={!isViewMode} // 只在编辑模式下可编辑
            />
          </Form.Item>

          <Form.Item label="酒店描述" name="description">
            <Input.TextArea
              placeholder="请输入酒店描述信息"
              rows={4}
              maxLength={500}
              showCount
              disabled={!isViewMode} // 只在编辑模式下可编辑
            />
          </Form.Item>
        </Form>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          {!isViewMode ? (
            <Space>
              <Button onClick={handleBack}>取消</Button>
              <Button type="primary" onClick={() => form.submit()}>
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

      {/* 设施政策卡片 */}
      <Card title="设施政策" loading={loading} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" initialValues={hotelData} size="large">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="入住时间" name={['facilityPolicies', 'checkInTime']}>
                <Input placeholder="请输入入住时间" disabled={!isViewMode} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="退房时间" name={['facilityPolicies', 'checkOutTime']}>
                <Input placeholder="请输入退房时间" disabled={!isViewMode} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="宠物政策" name={['facilityPolicies', 'petPolicy']}>
                <Input placeholder="请输入宠物政策" disabled={!isViewMode} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="取消政策" name={['facilityPolicies', 'cancellationPolicy']}>
                <Input placeholder="请输入取消政策" disabled={!isViewMode} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="其他政策" name={['facilityPolicies', 'otherPolicies']}>
            <Input.TextArea
              placeholder="请输入其他政策信息"
              rows={3}
              maxLength={300}
              showCount
              disabled={!isViewMode}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* 酒店房型信息卡片 */}
      <Card title="酒店房型" loading={loading} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" initialValues={hotelData} size="large">
          <Form.Item label="房型信息" name="roomTypes">
            <Input.TextArea
              placeholder="请输入酒店房型信息，如：标准间、豪华套房、商务间等"
              rows={3}
              maxLength={500}
              showCount
              disabled={!isViewMode}
            />
          </Form.Item>
        </Form>

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
            </Row>
          </Card>
        ))}

        {/* 房型保存按钮 - 只在编辑模式下显示 */}
        {!isViewMode && (
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button type="primary" onClick={submitHotelRoomTypes}>
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
