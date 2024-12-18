import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { message, Layout, Rate, Modal } from 'antd';
import { apiUrl } from '../utils/apiUrl';
import SideMenu from './SideMenu';
import CartModal from './CartModal';
import { ShoppingCartOutlined, StarOutlined } from '@ant-design/icons';

const HotelFoodsList = () => {
  const { hotelId } = useParams();
  const [foods, setFoods] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [foodRatings, setFoodRatings] = useState({});
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [tempRating, setTempRating] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchFoods();
    fetchUserRatings();
    updateCartCount();
  }, [hotelId]);

  const fetchFoods = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/hotels/${hotelId}/foods`);
      if (!response.ok) {
        throw new Error('Failed to fetch foods');
      }
      const data = await response.json();
      setFoods(data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      message.error('Failed to fetch foods');
    }
  };

  const fetchUserRatings = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/foodRatings/ratings/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      
      const ratings = await response.json();
      const ratingsMap = {};
      ratings.forEach(rating => {
        ratingsMap[rating.foodId] = rating.rating;
      });
      
      setFoodRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  };

  const handleAddToCart = (food) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(item => item._id === food._id);

    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += 1;
      message.success(`Added another ${food.name} to cart`);
    } else {
      existingCart.push({ ...food, quantity: 1 });
      message.success(`${food.name} added to cart`);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    updateCartCount();
  };

  const handleShowCart = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
    setIsCartModalVisible(true);
  };

  const handleUpdateQuantity = (itemName, newQuantity) => {
    const updatedCart = cartItems
      .map(item => item.name === itemName ? { ...item, quantity: newQuantity } : item)
      .filter(item => item.quantity > 0);

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartCount();
  };

  const handleRemoveItem = (itemName) => {
    const updatedCart = cartItems.filter(item => item.name !== itemName);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartCount();
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (cartItems, foods, user) => {
    try {
      const orderPromises = cartItems.map(async (cartItem) => {
        const food = foods.find(f => f.name === cartItem.name);
        
        const orderData = {
          userId: user?.id,
          foodId: food?._id,
          hotelId: food?.hotelId,
          quantity: cartItem.quantity,
          price: food?.price
        };

        const response = await fetch(`${apiUrl}/api/orders/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          throw new Error(`Failed to create order for ${food.name}`);
        }

        return response.json();
      });

      await Promise.all(orderPromises);
      localStorage.setItem('cart', '[]');
      updateCartCount();
      setIsCartModalVisible(false);
      setCartItems([]);
      message.success('Orders placed successfully!');

    } catch (error) {
      console.error('Checkout error:', error);
      message.error('Failed to place orders. Please try again.');
    }
  };

  const showRatingModal = (food) => {
    setSelectedFood(food);
    setTempRating(foodRatings[food._id] || 0);
    setIsRatingModalVisible(true);
  };

  const handleRatingSubmit = async () => {
    if (!user) {
      message.error('Please login to rate foods');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/foodRatings/${selectedFood._id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          rating: tempRating
        }),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      const data = await response.json();
      
      // Update foods list with new average rating
      setFoods(prevFoods => 
        prevFoods.map(food => 
          food._id === selectedFood._id 
            ? { ...food, rating: data.rating }
            : food
        )
      );
      
      // Update user ratings
      setFoodRatings(prev => ({
        ...prev,
        [selectedFood._id]: tempRating
      }));

      message.success('Rating submitted successfully!');
      setIsRatingModalVisible(false);
    } catch (error) {
      message.error('Failed to submit rating');
    }
  };

  return (
    <Layout className="min-h-screen">
      <div className="p-6 bg-gray-100 min-h-screen">
        <SideMenu />
        <div className="fixed top-4 right-4 z-10">
          <button
            onClick={handleShowCart}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 relative"
          >
            <ShoppingCartOutlined style={{ fontSize: '24px' }} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        <div className='flex-1 ml-[100px]'>
          <h1 className="text-2xl font-bold mb-4">Menu</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map(food => (
              <div key={food._id} className="p-4 bg-white shadow-md rounded-lg flex flex-col">
                <img 
                  src={food.pictures[0]}
                  alt={food.name}
                  className="h-32 w-full object-cover rounded-lg mb-2"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{food.name}</h2>
                  <p className="text-gray-600">{food.description}</p>
                  <p className="text-lg font-bold text-gray-800">${food.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Type: {food.type}</p>
                  
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <StarOutlined className="text-yellow-500" />
                      <span>{food.rating ? food.rating.toFixed(1) : '0'}</span>
                      <Rate 
                        disabled 
                        value={food.rating} 
                        allowHalf 
                        className="text-sm" 
                      />
                    </div>
                    
                    <button
                      onClick={() => showRatingModal(food)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Rate this food
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(food)}
                    className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CartModal 
          isVisible={isCartModalVisible}
          onClose={() => setIsCartModalVisible(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          calculateTotal={calculateTotal}
          onCheckout={handleCheckout}
          user={user}
          foods={foods}
        />

        <Modal
          title="Rate this food"
          open={isRatingModalVisible}
          onOk={handleRatingSubmit}
          onCancel={() => setIsRatingModalVisible(false)}
        >
          <div className="flex flex-col items-center gap-4">
            {selectedFood && (
              <>
                <h3 className="text-lg">{selectedFood.name}</h3>
                <Rate 
                  value={tempRating}
                  onChange={setTempRating}
                  allowHalf
                />
                <p className="text-gray-500">
                  {tempRating ? `You're giving ${tempRating} stars` : 'Click to rate'}
                </p>
              </>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default HotelFoodsList;
