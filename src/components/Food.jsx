import React from 'react';
import { Card, Button, Rate, message } from 'antd';
import { apiUrl } from '../utils/apiUrl';

function Food({ food, onCartUpdate, userRating, onRatingChange }) {
  const user = JSON.parse(localStorage.getItem('user'));

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.name === food.name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        name: food.name,
        price: food.price,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    onCartUpdate();
  };

  const handleRating = async (value) => {
    try {
      const response = await fetch(`${apiUrl}/api/foodRatings/${food._id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          rating: value
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const data = await response.json();
      onRatingChange(food._id, value, data.rating);
      message.success('Rating submitted successfully!');
    } catch (error) {
      message.error('Failed to submit rating');
    }
  };

  return (
    <Card
      hoverable
      cover={
        <img
          alt={food.name}
          src={food.pictures[0]}
          className="h-48 w-full object-cover"
        />
      }
      className="shadow-lg"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{food.name}</h3>
        <p className="text-gray-600">{food.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">${food.price}</span>
          <Button type="primary" onClick={addToCart}>
            Add to Cart
          </Button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Average Rating:</p>
          <Rate disabled value={food.rating} allowHalf />
          <span className="text-sm text-gray-500 ml-2">
            ({food.rating ? food.rating.toFixed(1) : '0'})
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Your Rating:</p>
          <Rate 
            value={userRating}
            onChange={handleRating}
          />
        </div>
      </div>
    </Card>
  );
}

export default Food;
