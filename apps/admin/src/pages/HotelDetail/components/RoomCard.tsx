import { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Button, Image, Modal, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { hotelApi } from '@/api/hotel';
import type { FrontendRoomDetail, RoomImage } from '@/types';

const IMAGE_FALLBACK =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwIBB8A3FG0AAA==';

interface RoomCardProps {
  room: FrontendRoomDetail;
  isViewMode: boolean;
  onRoomChange: (roomId: string, field: keyof FrontendRoomDetail, value: string) => void;
  onRemoveRoom: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, isViewMode, onRoomChange, onRemoveRoom }) => {
  const [images, setImages] = useState<RoomImage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const isNewRoom = room.id.startsWith('new_');

  useEffect(() => {
    if (!isNewRoom) {
      fetchImages();
    }
  }, [room.id, isNewRoom]);

  const fetchImages = async () => {
    try {
      const result = await hotelApi.getRoomImages(room.id);
      setImages(result);
    } catch (error) {
      console.error('获取房型图片失败:', error);
    }
  };

  const handleOpenImageModal = () => {
    if (isNewRoom) {
      message.warning('请先保存房型信息后再添加图片');
      return;
    }
    setNewImageUrl('');
    setModalVisible(true);
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      message.warning('请输入图片URL');
      return;
    }

    try {
      setImageLoading(true);
      await hotelApi.addRoomImages(room.id, [{ imageUrl: newImageUrl.trim() }]);
      message.success('图片添加成功');
      setModalVisible(false);
      setNewImageUrl('');
      fetchImages();
    } catch (error) {
      console.error('添加图片失败:', error);
      message.error('添加图片失败');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await hotelApi.deleteRoomImage(room.id, imageId);
      message.success('图片删除成功');
      fetchImages();
    } catch (error) {
      console.error('删除图片失败:', error);
      message.error('删除图片失败');
    }
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title="房间详情"
      extra={
        !isViewMode && (
          <Button type="text" danger onClick={() => onRemoveRoom(room.id)}>
            删除
          </Button>
        )
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>房间名称</label>
            <Input
              placeholder="请输入房间名称"
              value={room.roomName}
              onChange={(e) => onRoomChange(room.id, 'roomName', e.target.value)}
              disabled={isViewMode}
            />
          </div>
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>床铺数量</label>
            <Input
              placeholder="请输入床铺数量"
              value={room.bedCount}
              onChange={(e) => onRoomChange(room.id, 'bedCount', e.target.value)}
              disabled={isViewMode}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>房间大小</label>
            <Input
              placeholder="请输入房间大小（如：30㎡）"
              value={room.roomSize}
              onChange={(e) => onRoomChange(room.id, 'roomSize', e.target.value)}
              disabled={isViewMode}
            />
          </div>
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>入住人数</label>
            <Input
              placeholder="请输入最多入住人数"
              value={room.maxOccupancy}
              onChange={(e) => onRoomChange(room.id, 'maxOccupancy', e.target.value)}
              disabled={isViewMode}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>所在楼层</label>
            <Input
              placeholder="请输入所在楼层"
              value={room.floor}
              onChange={(e) => onRoomChange(room.id, 'floor', e.target.value)}
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
              onChange={(e) => onRoomChange(room.id, 'basePrice', e.target.value)}
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
              onClick={handleOpenImageModal}
              disabled={isNewRoom}
            >
              添加图片
            </Button>
          )}
        </div>

        {isNewRoom ? (
          <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
            请先保存房型信息后再添加图片
          </div>
        ) : images.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Image.PreviewGroup>
              {images.map((img) => (
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
                    fallback={IMAGE_FALLBACK}
                  />
                  {!isViewMode && (
                    <Popconfirm
                      title="确定删除这张图片吗？"
                      onConfirm={() => handleDeleteImage(img.id)}
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
          <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
            暂无图片，点击"添加图片"按钮添加
          </div>
        )}
      </div>

      {/* 添加图片弹窗 */}
      <Modal
        title="添加房型图片"
        open={modalVisible}
        onOk={handleAddImage}
        onCancel={() => setModalVisible(false)}
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
            <Image src={newImageUrl} alt="预览" width={200} fallback={IMAGE_FALLBACK} />
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default RoomCard;
