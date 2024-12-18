import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import gursha from '../assets/gursha.png'; // Ensure this path is correct
import { apiUrl } from '../utils/apiUrl';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const username = values.username; // Original username for display
      const modifiedValues = {
        ...values,
        username: username.toLowerCase() // Convert to lowercase for processing
      };

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modifiedValues) // Use modified values
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      message.success('Login successful!');
      
      // Redirect based on user role
      switch (data.user.role) {
        case 'restaurant':
          navigate('/hotel-dashboard');
          break;
        case 'delivery':
          navigate('/delivery');
          break;
        case 'customer':
          navigate('/dashboard');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center"> {/* Center the logo */}
          <img src={gursha} alt="Restaurant Logo" className="h-24 w-24 " /> {/* Moved logo to the top */}
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-orange-400">
            GURSHA DELIVERY
          </h2>
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to your account
          </h2>
        </div>
        <Form
          name="login"
          className="mt-8 space-y-6"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
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
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
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
              Log in
            </Button>
          </Form.Item>
          <div className="text-center">
            <Link to="/register" className="text-blue-600 hover:underline">
              Don't have an account? Register
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;