import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiUrl } from '../utils/apiUrl';

const EditFood = () => {
    const { foodId } = useParams();
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        type: '',
        pictures: []
    });

    useEffect(() => {
        const fetchFood = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/foods/find/${foodId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch food details');
                }
                const data = await response.json();
                setFood(data);
                setFormData({
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    type: data.type,
                    pictures: data.pictures
                });
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFood();
    }, [foodId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/api/foods/update/${foodId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error('Failed to update food');
            }
            alert('Food updated successfully!');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800">Edit Food Item</h2>
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

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-gray-700 font-medium block mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-gray-700 font-medium block mb-2">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-gray-700 font-medium block mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                rows="4"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-gray-700 font-medium block mb-2">Type</label>
                            <input
                                type="text"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-gray-700 font-medium block mb-2">Pictures (comma-separated URLs)</label>
                            <input
                                type="text"
                                name="pictures"
                                value={formData.pictures.join(', ')}
                                onChange={(e) => setFormData({ ...formData, pictures: e.target.value.split(', ') })}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full h-11 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                        >
                            Update Food
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EditFood; 