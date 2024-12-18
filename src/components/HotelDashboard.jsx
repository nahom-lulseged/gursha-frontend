import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/apiUrl';
import HotelSidemenu from './HotelSidemenu';

const HotelDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [foods, setFoods] = useState([]);

    useEffect(() => {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('user'); 
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
            const user = JSON.parse(storedUser);
            if (user.role !== 'restaurant') {
                window.location.href = "/login";
            }
        }
    }, []); 

 

    // console.log(userData);
    useEffect(() => {
        // Fetch foods when userData is available
        const fetchFoods = async () => {
            if (userData && userData.hotelId) {
                try {
                    const response = await fetch(`${apiUrl}/api/hotels/${userData.hotelId}/foods`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch foods');
                    }
                    const data = await response.json();
                    setFoods(data);
                } catch (error) {
                    console.error('Error fetching foods:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFoods();
    }, [userData]);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <HotelSidemenu />
            <div className="flex-1 p-8">
                <h2 className="text-3xl font-bold mb-8 text-gray-800">Hotel Dashboard</h2>

                {/* {userData && (
                    <div className="bg-white rounded-xl shadow-sm mb-8 p-6 border border-gray-100">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">User Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center">
                                <span className="text-gray-600 font-medium">Username:</span>
                                <span className="ml-2 text-gray-800">{userData.username}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-600 font-medium">Role:</span>
                                <span className="ml-2 text-gray-800">{userData.role}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-600 font-medium">Phone:</span>
                                <span className="ml-2 text-gray-800">{userData.phoneNumber}</span>
                            </div>
                            {userData.hotelId && (
                                <div className="flex items-center">
                                    <span className="text-gray-600 font-medium">Hotel:</span>
                                    <span className="ml-2 text-gray-800">{userData.hotelId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )} */}

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <p className="text-gray-600">Loading foods...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Foods Available</h3>
                            <button
                                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                                onClick={() => { window.location.href = "/create-food" }}
                            >
                                <span>Add Menu Item</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {foods.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {foods.map(food => (
                                    <div key={food._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{food.name}</h4>
                                        <p className="text-indigo-600 font-medium mb-2">${food.price}</p>
                                        <p className="text-gray-600 mb-3">{food.description}</p>
                                        <p className="text-sm text-gray-500 mb-4">Type: {food.type}</p>
                                        <div className="flex space-x-3 mb-4">
                                            {food.pictures.map((picture, index) => (
                                                <img key={index} src={picture} alt={food.name} className="w-20 h-20 object-cover rounded-lg" />
                                            ))}
                                        </div>
                                        <button
                                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                                            onClick={() => { window.location.href = `/edit-food/${food._id}` }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                <p className="text-gray-600">No foods available for this hotel.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelDashboard;