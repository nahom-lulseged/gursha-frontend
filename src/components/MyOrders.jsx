import React, { useEffect, useState } from 'react';
import { Layout, Table, Spin, Alert, Tag, Modal, Button } from 'antd';
import { apiUrl } from '../utils/apiUrl';
import SideMenu from './SideMenu';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

function MyOrders() {
  const [state, setState] = useState({
    orders: [],
    isLoading: true,
    error: null
  });
  const [selectedOrder, setSelectedOrder] = useState(null); // State to hold the selected order for modal
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const { data } = await response.json();
      setState(prev => ({ ...prev, orders: data, isLoading: false }));
    } catch (err) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/reject/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to cancel order');
      
      fetchOrders();
    } catch (err) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  };

  const showDeliveryDetails = (order) => {
    setSelectedOrder(order); // Set the selected order for modal
  };

  const handleModalClose = () => {
    setSelectedOrder(null); // Clear the selected order
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },
    {
      title: 'Food',
      dataIndex: ['foodId', 'name'],
      key: 'food'
    },
    {
      title: 'Hotel',
      dataIndex: ['hotelId', 'name'],
      key: 'hotel'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (total) => `$${total.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={
            status === 'pending' ? 'blue' :
            status === 'completed' ? 'green' :
            status === 'rejected' ? 'red' : 'default'
          }>
            {status?.toUpperCase()}
          </Tag>
          {status === 'pending' && (
            <Button onClick={() => handleCancelOrder(record._id)} className="ml-2" type="link" danger>
              Cancel
            </Button>
          )}
          {status === 'accepted' && (
            <Button onClick={() => showDeliveryDetails(record)} className="ml-2" type="link">
              View Details
            </Button>
          )}
        </div>
      )
    }
  ];

  const renderModal = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        title="Delivery Details"
        visible={!!selectedOrder}
        onCancel={handleModalClose}
        footer={null}
      >
        <p><strong>Delivery Boy:</strong> {selectedOrder.deliveryId?.username}</p>
        <p><strong>Phone Number:</strong> {selectedOrder.deliveryId?.phoneNumber}</p>
        <p><strong>Order ID:</strong> {selectedOrder._id}</p>
        <p><strong>Food:</strong> {selectedOrder.foodId.name}</p>
        <p><strong>Hotel:</strong> {selectedOrder.hotelId.name}</p>
        <Button onClick={handleModalClose}>Close</Button>
      </Modal>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Spin size="large" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-4">
        <Alert type="error" message={state.error} showIcon />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      <SideMenu onSignOut={handleLogout} />
      <Content className="p-6">
        <div className="bg-white rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
          <Table 
            columns={columns}
            dataSource={state.orders}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              position: ['bottomCenter']
            }}
          />
        </div>
      </Content>
      {renderModal()} {/* Render the modal if selectedOrder is set */}
    </Layout>
  );
}

export default MyOrders;
