import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, message } from 'antd';
import { apiUrl } from '../utils/apiUrl';

const CreateHotel = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/hotels/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create hotel');
      }

      const data = await response.json();
      message.success('Hotel created successfully!');
      // Reset form
      form.resetFields();
    } catch (error) {
      message.error('Failed to create hotel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Create New Hotel</h2>
        <button
          onClick={() => window.location.href = '/hotel-dashboard'}
          className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-6"
        >
          <Form.Item
            label={<span className="text-gray-700 font-medium">Hotel Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter hotel name' }]}
          >
            <Input className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium">Rating</span>}
            name="rating"
            rules={[{ required: true, message: 'Please enter rating' }]}
          >
            <InputNumber
              min={0}
              max={5}
              className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              step={0.5}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium">Picture URL</span>}
            name="picture"
            rules={[{ required: true, message: 'Please enter picture URL' }]}
          >
            <Input className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium">Location</span>}
            name="location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg text-base font-medium"
            >
              Create Hotel
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateHotel;
