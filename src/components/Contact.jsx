import React, { useState } from 'react';
import { Form, Input, Button, message, Layout } from 'antd';
import { apiUrl } from '../utils/apiUrl';

const { Content } = Layout;
const { TextArea } = Input;

function Contact() {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          name: values.name,
          email: values.email,
          message: values.message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      message.success('Message sent successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [form] = Form.useForm();

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="mb-4"
          >
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Contact Us
          </h1>
          
          <Form
            form={form}
            name="contact"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{
              name: user.name || '',
              email: user.email || ''
            }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input size="large" placeholder="Your name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input size="large" placeholder="Your email" />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: 'Please enter your message' }]}
            >
              <TextArea
                rows={6}
                placeholder="Your message"
                className="resize-none"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                size="large"
              >
                Send Message
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-8 text-center text-gray-600">
            <p>You can also reach us at:</p>
            <p className="font-semibold">support@gurshadelivery.com</p>
          </div>
        </div>
      </Content>
    </Layout>
  );

  
}

export default Contact;
