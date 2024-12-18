import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/apiUrl';
import HotelSidemenu from './HotelSidemenu'; // Import the side menu

const HotelOrders = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        // Fetch orders when userData is available
        const fetchOrders = async () => {
            if (userData && userData.hotelId) {
                try {
                    const response = await fetch(`${apiUrl}/api/hotels/${userData.hotelId}/orders`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch orders');
                    }
                    const data = await response.json();
                    setOrders(data);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
    }, [userData]);

    return (
        <div className="flex p-6 bg-gray-100 min-h-screen">
            <HotelSidemenu /> {/* Include the side menu */}
            <div className="flex-1 ml-4">
                <h2 className="text-3xl font-bold mb-6 text-center">Hotel Orders</h2>

                {loading ? (
                    <p className="text-center">Loading orders...</p>
                ) : (
                    <div>
                        {orders.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {orders.map(order => (
                                    <div key={order._id} className="bg-white shadow-md rounded-lg p-4">
                                        <h4 className="text-lg font-bold">Order ID: {order._id}</h4>
                                        <p className="text-gray-600">Customer: {order.userId.username} (Phone: {order.userId.phoneNumber})</p>
                                        <p className="text-gray-600">Food: {order.foodId.name} - ${order.foodId.price}</p>
                                        <p className="text-gray-600">Quantity: {order.quantity}</p>
                                        <p className="text-gray-600">Total: ${order.totalAmount}</p>
                                        <p className="text-gray-500">Status: {order.status}</p>
                                        {order.deliveryId && (
                                            <p className="text-gray-600">Delivery User: {order.deliveryId.username} (Phone: {order.deliveryId.phoneNumber})</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No orders available for this hotel.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelOrders; 