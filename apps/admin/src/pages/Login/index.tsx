import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Tabs, message, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useUserStore, type UserRole } from '@/store';
import { authApi, type LoginParams, type RegisterParams } from '@/api';
import { RpcError } from '@/utils/rpc';
import './index.css';

// 登录表单数据类型
interface LoginFormData {
  username: string;
  password: string;
  role: UserRole;
}

// 注册表单数据类型
interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
  role: UserRole;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm<LoginFormData>();
  const [registerForm] = Form.useForm<RegisterFormData>();
  const [loading, setLoading] = useState(false);

  // 处理登录
  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    try {
      const params: LoginParams = {
        username: values.username,
        password: values.password,
        role: values.role
      };

      // 调用登录接口
      const result = await authApi.login(params);

      // 登录成功，保存用户信息到 store
      login({
        username: result.user.username,
        role: result.user.role,
        token: result.token
      });

      message.success('登录成功！');
      // 跳转到首页
      navigate('/');
    } catch (error) {
      // 处理错误
      if (error instanceof RpcError) {
        message.error(error.message);
      } else {
        message.error('登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (values: RegisterFormData) => {
    setLoading(true);
    try {
      const params: RegisterParams = {
        username: values.username,
        password: values.password,
        email: values.email,
        phone: values.phone,
        role: values.role
      };

      // 调用注册接口
      await authApi.register(params);

      message.success('注册成功，请登录！');
      setActiveTab('login');
      // 自动填充登录表单
      loginForm.setFieldsValue({
        username: values.username,
        role: values.role
      });
    } catch (error) {
      // 处理错误
      if (error instanceof RpcError) {
        message.error(error.message);
      } else {
        message.error('注册失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 登录表单
  const LoginForm = (
    <Form
      form={loginForm}
      onFinish={handleLogin}
      size="large"
      autoComplete="off"
      initialValues={{ role: 'merchant' }}
    >
      <Form.Item name="role" rules={[{ required: true, message: '请选择登录身份' }]}>
        <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
          <Radio.Button value="merchant" style={{ flex: 1, textAlign: 'center' }}>
            🏪 商户登录
          </Radio.Button>
          <Radio.Button value="admin" style={{ flex: 1, textAlign: 'center' }}>
            👨‍💼 管理员登录
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  // 注册表单
  const RegisterForm = (
    <Form
      form={registerForm}
      onFinish={handleRegister}
      size="large"
      autoComplete="off"
      initialValues={{ role: 'merchant' }}
    >
      <Form.Item name="role" rules={[{ required: true, message: '请选择注册身份' }]}>
        <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
          <Radio.Button value="merchant" style={{ flex: 1, textAlign: 'center' }}>
            🏪 商户注册
          </Radio.Button>
          <Radio.Button value="admin" style={{ flex: 1, textAlign: 'center' }}>
            👨‍💼 管理员注册
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少3个字符' }
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>
      <Form.Item
        name="phone"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
        ]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="手机号" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6个字符' }
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            }
          })
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          注册
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    { key: 'login', label: '登录', children: LoginForm },
    { key: 'register', label: '注册', children: RegisterForm }
  ];

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <span className="login-logo">🏨</span>
          <h2 className="login-title">酒店预订管理系统</h2>
        </div>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} centered />
      </Card>
    </div>
  );
};

export default Login;
