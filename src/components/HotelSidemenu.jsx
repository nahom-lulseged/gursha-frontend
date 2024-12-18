import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard, MdFastfood, MdHotel, MdReceipt, MdRestaurant } from 'react-icons/md';
import { NavLink } from 'react-router-dom';

const SideMenu = ({ onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user'); 
    if (storedUser) { 
        const user = JSON.parse(storedUser);
        if (user.role !== 'restaurant') {
            window.location.href = "/login";
        }
    }
}, []); 



  const menuLinkStyles = ({ isActive }) => 
    `flex items-center gap-3 p-2 rounded-md transition-colors ${
      isActive 
        ? 'bg-gray-700 text-white' 
        : 'hover:bg-gray-700 text-gray-300 hover:text-white'
    }`;

  const handleSignOut = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
    if (onSignOut) onSignOut(); // Call the passed onSignOut prop if it exists
  };

  return (
    <>
      <button 
        className="fixed z-50 top-4 left-4 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div className={`fixed top-0 left-0 bg-gray-800 text-white w-64 h-screen transition-all duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-64'
      }`}>
        <div className="pt-16 px-4">
          <nav className="space-y-4">
            <NavLink to="/hotel-dashboard" className={menuLinkStyles}>
              <MdDashboard size={20} />
              <span>Dashboard</span>
            </NavLink> 
            <NavLink to="/create-food" className={menuLinkStyles}>
              <MdRestaurant size={20} />
              <span>Add Food</span>
            </NavLink>
            <NavLink to="/hotel-orders" className={menuLinkStyles}>
              <MdReceipt size={20} />
              <span>Hotel Orders</span>
            </NavLink>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-md w-full text-left text-red-400 hover:text-red-300 transition-colors"
            >
              <FaSignOutAlt size={20} />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
