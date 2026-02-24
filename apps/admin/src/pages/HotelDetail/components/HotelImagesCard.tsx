import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Image,
  Modal,
  Input,
  Popconfirm,
  Upload,
  Radio,
  message
} from 'antd';
import { PlusOutlined, DeleteOutlined, PictureOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { hotelApi } from '@/api/hotel';
import { uploadApi, getFullImageUrl } from '@/api/upload';
import type { HotelImage } from '@/types';

interface HotelImagesCardProps {
  hotelId: string;
  isViewMode: boolean;
  loading: boolean;
}

type UploadMode = 'url' | 'file';

const IMAGE_FALLBACK =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwIBB8A3FG0AAA==';

// 最大文件大小：2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const HotelImagesCard: React.FC<HotelImagesCardProps> = ({ hotelId, isViewMode, loading }) => {
  const [coverImage, setCoverImage] = useState<string>('');
  const [images, setImages] = useState<HotelImage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'cover' | 'gallery'>('cover');
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
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
    setFileList([]);
    setUploadMode('file');
    setModalVisible(true);
  };

  // 上传前校验
  const beforeUpload = (file: RcFile) => {
    const isValidType = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ].includes(file.type);
    if (!isValidType) {
      message.error('仅支持 JPG、PNG、WebP、GIF 格式的图片');
      return Upload.LIST_IGNORE;
    }

    if (file.size > MAX_FILE_SIZE) {
      message.error('图片大小不能超过 2MB');
      return Upload.LIST_IGNORE;
    }

    return true; // 允许添加到列表，实际上传由 customRequest 控制
  };

  const handleAddImage = async () => {
    // 验证输入
    if (uploadMode === 'url') {
      if (!newImageUrl.trim()) {
        message.warning('请输入图片URL');
        return;
      }
    } else {
      if (fileList.length === 0) {
        message.warning('请选择要上传的图片');
        return;
      }
    }

    try {
      setImageLoading(true);

      let imageUrl = '';

      if (uploadMode === 'url') {
        imageUrl = newImageUrl.trim();
      } else {
        // 上传文件
        const file = fileList[0].originFileObj as File;
        const result = await uploadApi.uploadImage(file);
        imageUrl = result.url;
      }

      if (modalType === 'cover') {
        await hotelApi.updateCoverImage(hotelId, imageUrl);
        setCoverImage(imageUrl);
        message.success('主图设置成功');
      } else {
        await hotelApi.addHotelImages(hotelId, [{ imageUrl }]);
        fetchImages();
        message.success('图片添加成功');
      }
      setModalVisible(false);
      setNewImageUrl('');
      setFileList([]);
    } catch (error) {
      console.error('操作失败:', error);
      message.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await hotelApi.deleteHotelImage(hotelId, imageId);
      fetchImages();
      message.success('图片删除成功');
    } catch (error) {
      console.error('删除图片失败:', error);
      message.error('删除图片失败');
    }
  };

  const handleClearCover = async () => {
    try {
      await hotelApi.updateCoverImage(hotelId, '');
      setCoverImage('');
      message.success('主图已清除');
    } catch (error) {
      console.error('清除主图失败:', error);
      message.error('清除主图失败');
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
                  src={getFullImageUrl(coverImage)}
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
                        src={getFullImageUrl(img.imageUrl)}
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
        destroyOnClose
      >
        {/* 上传模式切换 */}
        <div style={{ marginBottom: 16 }}>
          <Radio.Group
            value={uploadMode}
            onChange={(e) => {
              setUploadMode(e.target.value);
              setFileList([]);
              setNewImageUrl('');
            }}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="file">上传文件</Radio.Button>
            <Radio.Button value="url">输入URL</Radio.Button>
          </Radio.Group>
        </div>

        {uploadMode === 'file' ? (
          <div>
            <Upload.Dragger
              fileList={fileList}
              onChange={({ fileList: newFileList }) => {
                // 只保留最后一个文件，并设置状态为 done
                const lastFile = newFileList[newFileList.length - 1];
                if (lastFile) {
                  lastFile.status = 'done';
                  setFileList([lastFile]);
                } else {
                  setFileList([]);
                }
              }}
              beforeUpload={beforeUpload}
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              maxCount={1}
              listType="picture"
              customRequest={({ onSuccess }) => {
                // 阻止默认上传行为，手动控制
                setTimeout(() => onSuccess?.('ok'), 0);
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">支持 JPG、PNG、WebP、GIF 格式，最大 2MB</p>
            </Upload.Dragger>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 8, color: '#666' }}>请输入图片URL地址：</div>
            <Input.TextArea
              placeholder="请输入图片URL，例如：https://example.com/image.jpg"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              rows={3}
            />
            {newImageUrl && (
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8, color: '#666' }}>图片预览：</div>
                <Image src={newImageUrl} alt="预览" width={200} fallback={IMAGE_FALLBACK} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default HotelImagesCard;
