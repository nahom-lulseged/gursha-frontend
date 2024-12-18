import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Hotels from './components/Hotels'
import Foods from './components/Food'
import Dashboard from './components/Dashboard'
import CreateHotel from './components/CreateHotel'
import CreateFood from './components/CreateFood'
import MyOrders from './components/MyOrders'
import HotelDashboard from './components/HotelDashboard'
import DeliveryDashboard from './components/DeliveryDashboard'
import HotelOrders from './components/HotelOrders'
import EditFood from './components/EditFood'
import HotelFoodsList from './components/HotelFoodsList'
import Contact from './components/Contact'
import Admin from './components/admin/Admin' 
function App() {
  return (
    <Router>
      <div> 
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/" element={<Dashboard />} /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/create-hotel" element={<CreateHotel />} />
          <Route path="/create-food" element={<CreateFood />} />
          <Route path="/edit-food/:foodId" element={<EditFood />} />
          
          <Route path="/my-orders" element={<MyOrders />} /> 
          <Route path="/hotel-dashboard" element={<HotelDashboard />} />
          <Route path="/delivery" element={<DeliveryDashboard />} />
          <Route path="/hotel-orders" element={<HotelOrders />} />
          <Route path="/hotel/:hotelId" element={<HotelFoodsList />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} /> 
        </Routes>
      </div>
    </Router>
  )
}

// BackButton Component
const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} className="p-2 border rounded">
      Back
    </button>
  );
};

export default App
