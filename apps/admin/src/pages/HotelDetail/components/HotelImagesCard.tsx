import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Image, Modal, Input, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { hotelApi } from '@/api/hotel';
import type { HotelImage } from '@/types';

interface HotelImagesCardProps {
  hotelId: string;
  isViewMode: boolean;
  loading: boolean;
}

const IMAGE_FALLBACK =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwIBB8A3FG0AAA==';

const HotelImagesCard: React.FC<HotelImagesCardProps> = ({ hotelId, isViewMode, loading }) => {
  const [coverImage, setCoverImage] = useState<string>('');
  const [images, setImages] = useState<HotelImage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'cover' | 'gallery'>('cover');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (hotelId) {
      fetchCoverImage();
      fetchImages();
    }
  }, [hotelId]);

  const fetchCoverImage = async () => {
    try {
      const detail = await hotelApi.getDetail(hotelId);
      setCoverImage(detail.coverImage || '');
    } catch (error) {
      console.error('获取酒店主图失败:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const result = await hotelApi.getHotelImages(hotelId);
      setImages(result);
    } catch (error) {
      console.error('获取酒店图片失败:', error);
    }
  };

  const handleOpenModal = (type: 'cover' | 'gallery') => {
    setModalType(type);
    setNewImageUrl('');
    setModalVisible(true);
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;

    try {
      setImageLoading(true);
      if (modalType === 'cover') {
        await hotelApi.updateCoverImage(hotelId, newImageUrl.trim());
        setCoverImage(newImageUrl.trim());
      } else {
        await hotelApi.addHotelImages(hotelId, [{ imageUrl: newImageUrl.trim() }]);
        fetchImages();
      }
      setModalVisible(false);
      setNewImageUrl('');
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await hotelApi.deleteHotelImage(hotelId, imageId);
      fetchImages();
    } catch (error) {
      console.error('删除图片失败:', error);
    }
  };

  const handleClearCover = async () => {
    try {
      await hotelApi.updateCoverImage(hotelId, '');
      setCoverImage('');
    } catch (error) {
      console.error('清除主图失败:', error);
    }
  };

  return (
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
                <Button type="link" size="small" onClick={() => handleOpenModal('cover')}>
                  {coverImage ? '更换' : '设置'}
                </Button>
              )}
            </div>
            {coverImage ? (
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
                  src={coverImage}
                  alt="酒店主图"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  fallback={IMAGE_FALLBACK}
                />
                {!isViewMode && (
                  <Popconfirm
                    title="确定清除主图吗？"
                    onConfirm={handleClearCover}
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
                酒店图集 ({images.length} 张)
              </label>
              {!isViewMode && (
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal('gallery')}
                >
                  添加图片
                </Button>
              )}
            </div>
            {images.length > 0 ? (
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
                        alt="酒店图片"
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

      {/* 图片弹窗 */}
      <Modal
        title={modalType === 'cover' ? '设置酒店主图' : '添加酒店图片'}
        open={modalVisible}
        onOk={handleAddImage}
        onCancel={() => setModalVisible(false)}
        confirmLoading={imageLoading}
        okText={modalType === 'cover' ? '设置' : '添加'}
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

export default HotelImagesCard;
