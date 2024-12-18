import React, { useState } from 'react';
import './App.css'; // Import your CSS file
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <header className="flex justify-between items-center p-4">
        <h1>My Application</h1>
        <button onClick={toggleDarkMode} className="p-2 border rounded">
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>
      <main>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Dashboard />} />
            {/* Add other routes here */}
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;