import { useState } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, message } from 'antd';
import { hotelApi } from '@/api/hotel';
import type { HotelType } from '@/types';
import { RpcError } from '@/utils/rpc';

const { Text } = Typography;

/** 酒店类型选项 */
const HOTEL_TYPE_OPTIONS = [
  { value: 'business', label: '商务酒店' },
  { value: 'resort', label: '度假酒店' },
  { value: 'boutique', label: '精品酒店' },
  { value: 'budget', label: '经济酒店' },
  { value: 'apartment', label: '公寓式酒店' },
  { value: 'standard', label: '标准酒店' },
  { value: 'hostel', label: '青年旅舍' }
];

interface CreateHotelModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
  hotelType: HotelType;
}

const CreateHotelModal: React.FC<CreateHotelModalProps> = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await hotelApi.create({
        name: values.name,
        hotelType: values.hotelType
      });

      message.success('酒店创建成功，请点击编辑完善详细信息');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('创建酒店失败:', error);
      if (error instanceof RpcError) {
        message.error(error.message || '创建失败');
      } else if (error && typeof error === 'object' && 'errorFields' in error) {
        message.error('请检查表单信息');
      } else {
        message.error('创建失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新建酒店"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={500}
      okText="创建"
      cancelText="取消"
      confirmLoading={loading}
      okButtonProps={{ disabled: loading }}
      destroyOnClose
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
          <Select placeholder="请选择酒店类型" options={HOTEL_TYPE_OPTIONS} />
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
  );
};

export default CreateHotelModal;
