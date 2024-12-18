import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Rate, Spin, Alert, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import { apiUrl } from '../utils/apiUrl';
import SideMenu from './SideMenu';

const { Title } = Typography;

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')); 
  const userId = user.id; 
  const [userRatings, setUserRatings] = useState({});
  
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        // Fetch both hotels and user ratings in parallel
        const [hotelsResponse, ratingsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/hotels/all`),  // Assuming this endpoint exists to get all hotels
          fetch(`${apiUrl}/api/ratings/ratings/${userId}`)
        ]);

        if (!hotelsResponse.ok) throw new Error('Failed to fetch hotels');
        if (!ratingsResponse.ok) throw new Error('Failed to fetch user ratings');

        const hotelsData = await hotelsResponse.json();
        const ratingsData = await ratingsResponse.json();

        // Convert ratings array to object for easier lookup
        const ratingsMap = {};
        ratingsData.forEach(rating => {
          ratingsMap[rating.hotelId] = rating.rating;
        });

        setUserRatings(ratingsMap);
        setHotels(hotelsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [userId]);

  const handleRating = async (hotelId, rating) => {
    try {
      const response = await fetch(`${apiUrl}/api/ratings/${hotelId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const updatedHotel = await response.json();
      
      // Update hotels list with new average rating
      setHotels(prevHotels => 
        prevHotels.map(hotel => 
          hotel._id === hotelId 
            ? { ...hotel, rating: updatedHotel.rating } 
            : hotel
        )
      );
      
      // Update user ratings
      setUserRatings(prev => ({ ...prev, [hotelId]: rating }));
      
      message.success('Rating submitted successfully!');
    } catch (err) {
      message.error(err.message || 'Failed to submit rating');
    }
  };

  if (loading) {
    return <Spin className="flex justify-center items-center min-h-screen" size="large" />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" className="m-4" />;
  }

  return (
    <div className="flex">
      <SideMenu />
      <div className="ml-[100px] flex-1 p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Card
              key={hotel._id}
              hoverable
              cover={
                <Link to={`/hotel/${hotel._id}`}>
                  <img 
                    src={hotel.picture} 
                    alt={hotel.name}
                    className="h-48 w-full object-cover"
                  />
                </Link>
              }
              className="shadow-lg"
            >
              <Link to={`/hotel/${hotel._id}`}>
                <Title level={4}>{hotel.name}</Title>
              </Link>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm text-gray-500">Average Rating:</p>
                  <Rate 
                    disabled 
                    value={hotel.rating} 
                    allowHalf 
                    className="block mb-2" 
                  />
                  <span className="text-sm text-gray-500">
                    ({hotel.rating ? hotel.rating.toFixed(1) : '0'})
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Your Rating:</p>
                  <Rate 
                    value={userRatings[hotel._id] || 0}
                    onChange={(value) => handleRating(hotel._id, value)}
                    className="block mb-2"
                  />
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold">Location:</span> {hotel.location}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hotels;
