import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../utils/apiUrl';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    phoneNumber: '',
    role: 'customer',
    password: ''
  });
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const [isCreateHotelModalOpen, setIsCreateHotelModalOpen] = useState(false);
  const [newHotel, setNewHotel] = useState({
    name: '',
    rating: 0,
    picture: '',
    location: ''
  });

  if (user && user.role !== 'admin') {
    window.location.href = '/login';
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, hotelsResponse, ordersResponse, messagesResponse] = await Promise.all([
          fetch(`${apiUrl}/api/admin/getUsers`),
          fetch(`${apiUrl}/api/admin/getHotels`),
          fetch(`${apiUrl}/api/orders/read/all-orders`),
          fetch(`${apiUrl}/api/messages`)
        ]);

        if (!usersResponse.ok || !hotelsResponse.ok || !ordersResponse.ok || !messagesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const usersData = await usersResponse.json();
        const hotelsData = await hotelsResponse.json();
        const ordersData = await ordersResponse.json();
        const messagesData = await messagesResponse.json();

        setUsers(usersData);
        setHotels(hotelsData);
        setOrders(ordersData.data);
        setMessages(messagesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/admin/removeUser/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const getFilteredUsers = () => {
    if (userRoleFilter === 'all') return users;
    return users.filter(user => user.role === userRoleFilter);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/admin/updateUser/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editingUser.username,
          phoneNumber: editingUser.phoneNumber,
          role: editingUser.role,
          hotelId: editingUser.hotelId || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();

      setUsers(users.map(user => 
        user._id === editingUser._id ? updatedUser : user
      ));
      
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const createdUser = await response.json();
      setUsers([...users, createdUser]);
      setIsCreateModalOpen(false);
      setNewUser({
        username: '',
        phoneNumber: '',
        role: 'customer',
        password: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter(message => message._id !== messageId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/hotels/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHotel),
      });

      if (!response.ok) {
        throw new Error('Failed to create hotel');
      }

      const createdHotel = await response.json();
      setHotels([...hotels, createdHotel]);
      setIsCreateHotelModalOpen(false);
      setNewHotel({
        name: '',
        rating: 0,
        picture: '',
        location: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const AdminSidemenu = () => {
    return (
      <div className="fixed top-0 left-0 w-64 h-screen bg-white shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xl">{user?.username?.[0]}</span>
            </div>
            <div>
              <h3 className="font-medium">{user?.username}</h3>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full mb-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <span>➕</span>
              <span>Create New User</span>
            </span>
          </button>

          <button 
            onClick={() => setIsCreateHotelModalOpen(true)}
            className="w-full mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <span>🏨</span>
              <span>Create New Hotel</span>
            </span>
          </button>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>👥</span>
                <span>Users</span>
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('hotels')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'hotels' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🏨</span>
                <span>Hotels</span>
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📦</span>
                <span>Orders</span>
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('messages')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'messages' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>💬</span>
                <span>Messages</span>
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

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="flex">
      <AdminSidemenu />
      <div className="flex-1 ml-64 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Hotels</h3>
            <p className="text-3xl font-bold text-blue-600">{hotels.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Restaurant Owners</h3>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter(user => user.role === 'restaurant').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Delivery Users</h3>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter(user => user.role === 'delivery').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'users' ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setUserRoleFilter('all')}
                    className={`px-4 py-2 rounded-lg ${userRoleFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('customer')}
                    className={`px-4 py-2 rounded-lg ${userRoleFilter === 'customer' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Customers
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('restaurant')}
                    className={`px-4 py-2 rounded-lg ${userRoleFilter === 'restaurant' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Restaurant Owners
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('delivery')}
                    className={`px-4 py-2 rounded-lg ${userRoleFilter === 'delivery' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Delivery Users
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('admin')}
                    className={`px-4 py-2 rounded-lg ${userRoleFilter === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Admins
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredUsers().map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'restaurant' ? 'bg-green-100 text-green-800' :
                            user.role === 'delivery' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phoneNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditModalOpen(true);
                            }} 
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)} 
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'hotels' ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Hotel Management</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hotels.map(hotel => (
                      <tr key={hotel._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="flex items-center">
                            {hotel.rating.toFixed(1)} ⭐
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.reviews.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'orders' ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Order Management</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery User</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order._id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.userId?.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.foodId?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.hotelId?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.deliveryId?.username || 'Not assigned'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'messages' ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Messages & Comments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages?.map(message => (
                      <tr key={message._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {message.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {message.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xl break-words">{message.message}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </td> 
                      </tr>
                    ))}
                    {(!messages || messages.length === 0) && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No messages found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Edit User</h2>
              <form onSubmit={handleEditUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      value={editingUser.phoneNumber}
                      onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hotel ID</label>
                    <select
                      value={editingUser.hotelId || ''}
                      onChange={(e) => setEditingUser({...editingUser, hotelId: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">No Hotel</option>
                      {hotels.map(hotel => (
                        <option key={hotel._id} value={hotel._id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="restaurant">Restaurant Owner</option>
                      <option value="delivery">Delivery User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Create New User</h2>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      value={newUser.phoneNumber}
                      onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="customer">Customer</option>
                      <option value="restaurant">Restaurant Owner</option>
                      <option value="delivery">Delivery User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setNewUser({
                        username: '',
                        phoneNumber: '',
                        role: 'customer',
                        password: ''
                      });
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isCreateHotelModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Create New Hotel</h2>
              <form onSubmit={handleCreateHotel}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
                    <input
                      type="text"
                      value={newHotel.name}
                      onChange={(e) => setNewHotel({...newHotel, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={newHotel.rating}
                      onChange={(e) => setNewHotel({...newHotel, rating: parseFloat(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Picture URL</label>
                    <input
                      type="text"
                      value={newHotel.picture}
                      onChange={(e) => setNewHotel({...newHotel, picture: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={newHotel.location}
                      onChange={(e) => setNewHotel({...newHotel, location: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Hotel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateHotelModalOpen(false);
                      setNewHotel({
                        name: '',
                        rating: 0,
                        picture: '',
                        location: ''
                      });
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
