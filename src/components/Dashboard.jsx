import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Spin, Alert, message } from 'antd';
import Food from './Food';
import SideMenu from './SideMenu';
import CartModal from './CartModal';
import DashboardHeader from './DashboardHeader';
import { apiUrl } from '../utils/apiUrl';
import banner1 from "../assets/banner1.png"
import banner2 from "../assets/banner2.png"
import banner3 from "../assets/banner3.png"
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const { Content, Footer } = Layout;

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));  
  
  const [state, setState] = useState({
    foods: [],
    isLoading: true,
    error: null,
    cartCount: 0,
    isCartModalVisible: false,
    cartItems: []
  });

  const [banners, setBanners] = useState([banner1, banner2, banner3]);
  const [foodRatings, setFoodRatings] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchFoods();
    fetchUserRatings();
    updateCartCount();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/foods/all`);
      if (!response.ok) throw new Error('Failed to fetch foods');
      const data = await response.json();
      setState(prev => ({ ...prev, foods: data, isLoading: false }));
    } catch (err) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const fetchUserRatings = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/foodRatings/ratings/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      
      const ratings = await response.json();
      const ratingsMap = {};
      ratings.forEach(rating => {
        ratingsMap[rating.foodId] = rating.rating;
      });
      
      setFoodRatings(ratingsMap);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

  const handleRatingChange = (foodId, userRating, newAverageRating) => {
    setFoodRatings(prev => ({
      ...prev,
      [foodId]: userRating
    }));

    setState(prev => ({
      ...prev,
      foods: prev.foods.map(food => 
        food._id === foodId 
          ? { ...food, rating: newAverageRating }
          : food
      )
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setState(prev => ({ ...prev, cartCount: count }));
  };

  const handleShowCart = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemsWithImages = items.map(item => {
      const food = state.foods.find(f => f.name === item.name);
      return {
        ...item,
        pictures: food?.pictures
      };
    });
    
    setState(prev => ({ 
      ...prev, 
      cartItems: itemsWithImages, 
      isCartModalVisible: true 
    }));
  };

  const handleUpdateQuantity = (itemName, newQuantity) => {
    const updatedCart = state.cartItems
      .map(item => item.name === itemName ? { ...item, quantity: newQuantity } : item)
      .filter(item => item.quantity > 0);

    setState(prev => ({ ...prev, cartItems: updatedCart }));
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartCount();
  };

  const handleRemoveItem = (itemName) => {
    const updatedCart = state.cartItems.filter(item => item.name !== itemName);
    setState(prev => ({ ...prev, cartItems: updatedCart }));
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartCount();
  };

  const calculateTotal = () => {
    return state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (cartItems, foods, user) => {
    try {
      // Show loading state
      setState(prev => ({ ...prev, isLoading: true }));

      // Map cart items to order format
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

      // Wait for all orders to be created
      await Promise.all(orderPromises);

      // Clear cart after successful checkout
      localStorage.setItem('cart', '[]');
      updateCartCount();

      // Close modal and show success
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isCartModalVisible: false,
        cartItems: []
      }));

      // Show success message
      message.success('Orders placed successfully!');

    } catch (error) {
      console.error('Checkout error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      message.error('Failed to place orders. Please try again.');
    }
  };

  const renderContent = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.foods.length > 0 ? (
          state.foods.map((food) => (
            <Food
              key={food._id}
              food={food}
              onCartUpdate={updateCartCount}
              userRating={foodRatings[food._id] || 0}
              onRatingChange={handleRatingChange}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            No foods available
          </div>
        )}
      </div>
    );
  };

  const renderBanners = () => {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
    };

    return (
      <Slider {...settings}> 
          {banners.map((banner, index) => (
            <div key={index} className="banner-container">
              <img src={banner} alt={`Banner ${index + 1}`} className="w-full h-[400px] object-contain" />
            </div>
          ))} 
      </Slider>
    );
  };

  return (
    <Layout className="min-h-screen">
      <SideMenu onSignOut={handleLogout} />
      <DashboardHeader 
        user={user}
        cartCount={state.cartCount}
        onShowCart={handleShowCart}
        onLogout={handleLogout}
      />
      <Content className='p-6'>
      {renderBanners()}
      </Content>
      
      <Content className="p-6">
        <div className="bg-white rounded-lg p-6"> 
          {renderContent()}
        </div>
      </Content>

      <CartModal 
        isVisible={state.isCartModalVisible}
        onClose={() => setState(prev => ({ ...prev, isCartModalVisible: false }))}
        cartItems={state.cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        calculateTotal={calculateTotal}
        onCheckout={handleCheckout}
        user={user}
        foods={state.foods}
      />

      <Footer className="text-center bg-gray-100">
        ©{new Date().getFullYear()} Gursha Delivery App. All Rights Reserved.
      </Footer>
    <div className="text-center mt-2 mb-2">
      <button
        onClick={() => window.location.href = '/contact'}
        className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
      >
        Contact Us
      </button>
    </div>
    </Layout>
  );
}

export default Dashboard;
