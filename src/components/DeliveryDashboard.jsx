import React, { useEffect, useState } from 'react';
import { apiUrl } from '../utils/apiUrl';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [acceptedOrders, setAcceptedOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const user = JSON.parse(localStorage.getItem('user'));
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();

    // Fetch pending and accepted orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Fetch pending orders
                const pendingResponse = await fetch(`${apiUrl}/api/orders/pending-orders`);
                const pendingData = await pendingResponse.json();
                if (pendingData.success) {
                    setPendingOrders(pendingData.data);
                } else {
                    console.error('Error fetching pending orders:', pendingData.message);
                }

                // Fetch accepted orders for the logged-in delivery user
                const acceptedResponse = await fetch(`${apiUrl}/api/orders/user/${user.id}/accepted-orders`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token if needed
                    }
                });
                const acceptedData = await acceptedResponse.json();
                if (acceptedData.success) {
                    setAcceptedOrders(acceptedData.data);
                } else {
                    console.error('Error fetching accepted orders:', acceptedData.message);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, [user.id]);

    // Function to accept an order
    const acceptOrder = async (orderId) => {
        try {
            const response = await fetch(`${apiUrl}/api/orders/accept/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token if needed
                },
                body: JSON.stringify({ deliveryId: user.id }) // Send deliveryId as the logged-in user's ID
            });

            const data = await response.json();
            if (data.success) {
                message.success('Order accepted successfully!');
                // Refresh the pending orders after accepting
                setPendingOrders(pendingOrders.filter(order => order._id !== orderId));
            } else {
                message.error(data.message);
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            message.error('Failed to accept order');
        }
    };

    const showOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const OrderDetailsModal = () => (
        <Modal
            title="Order Details"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
                selectedOrder && activeTab === 'pending' && (
                    <button
                        key="accept"
                        onClick={() => {
                            acceptOrder(selectedOrder._id);
                            setIsModalVisible(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Accept Order
                    </button>
                )
            ]}
        >
            {selectedOrder && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        {selectedOrder.foodId.pictures?.[0] && (
                            <img
                                src={selectedOrder.foodId.pictures[0]}
                                alt={selectedOrder.foodId.name}
                                className="w-24 h-24 object-cover rounded"
                            />
                        )}
                        <div>
                            <h3 className="font-semibold text-lg">{selectedOrder.foodId.name}</h3>
                            <p className="text-blue-600 font-medium">${selectedOrder.foodId.price}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-600">Customer Details</h4>
                            <p>{selectedOrder.userId.username}</p>
                            <p>{selectedOrder.userId.phoneNumber}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-600">Hotel Details</h4>
                            <p>{selectedOrder.hotelId.name}</p>
                            <p className="text-sm text-gray-500">{selectedOrder.hotelId.location}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-600">Order Info</h4>
                        <p>Status: <span className="capitalize">{selectedOrder.status}</span></p>
                        <p>Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            )}
        </Modal>
    );

    // Add this new component inside DeliveryDashboard
    const DeliverySidemenu = () => {
        const handleLogout = () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
        };

        return (
            <div className="w-64 min-h-screen bg-white shadow-lg flex flex-col">
                <div className="p-4 flex-1">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xl">{user.username?.[0]}</span>
                        </div>
                        <div>
                            <h3 className="font-medium">{user.username}</h3>
                            <p className="text-sm text-gray-500">Delivery Partner</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'pending' 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center space-x-2">
                                <span>🔄</span>
                                <span>Pending Orders</span>
                            </span>
                        </button>

                        <button 
                            onClick={() => setActiveTab('accepted')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'accepted' 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center space-x-2">
                                <span>✅</span>
                                <span>Accepted Orders</span>
                            </span>
                        </button>
                    </nav>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="p-4 text-left hover:bg-red-50 text-red-600 border-t"
                >
                    <span className="flex items-center space-x-2">
                        <span>🚪</span>
                        <span>Logout</span>
                    </span>
                </button>
            </div>
        );
    };

    return (
        <div className="flex">
            <DeliverySidemenu />
            <div className="flex-1 p-6 bg-gray-100 min-h-screen">
                <h1 className="text-2xl text-center mb-4">Delivery Dashboard</h1>
                
                {/* Remove the existing tab buttons since they're now in the sidemenu */}
                <div className="bg-white rounded-lg shadow">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Order ID</th>
                                <th className="py-3 px-6 text-left">Date</th>
                                <th className="py-3 px-6 text-left">Customer</th>
                                <th className="py-3 px-6 text-left">Status</th>
                                <th className="py-3 px-6 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {(activeTab === 'pending' ? pendingOrders : acceptedOrders).map(order => (
                                <tr
                                    key={order._id}
                                    className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => showOrderDetails(order)}
                                >
                                    <td className="py-3 px-6">{order._id.slice(-6)}</td>
                                    <td className="py-3 px-6">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-6">{order.userId.username}</td>
                                    <td className="py-3 px-6">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6">
                                        <button className="text-blue-500 hover:text-blue-700">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <OrderDetailsModal />
            </div>
        </div>
    );
};

export default DeliveryDashboard;
