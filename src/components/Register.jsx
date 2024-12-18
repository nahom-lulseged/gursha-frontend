import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Select } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { apiUrl } from '../utils/apiUrl';

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    console.log('Form Values:', values);
    setLoading(true);
    try {
      const dataToSend = { ...values, role: 'customer' };
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      console.log('Response Data:', data);
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      message.success('Registration successful!');
      navigate('/login');
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <Form
          name="register"
          className="mt-8 space-y-6"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your username!'
              },
              {
                min: 3,
                message: 'Username must be at least 3 characters!'
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Username"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!'
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters!'
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: 'Please input your phone number!'
              },
              {
                pattern: /^\d{10}$/,
                message: 'Please enter a valid 10-digit phone number!'
              }
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Phone Number"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="large"
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Button 
              type="link" 
              onClick={() => navigate('/login')}
              className="p-0 text-blue-600 hover:text-blue-700"
            >
              Login here
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Register;