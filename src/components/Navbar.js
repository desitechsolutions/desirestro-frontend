import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-amber-700 to-orange-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍛</span>
            <h1 className="text-xl font-extrabold tracking-wide text-white">
              DesiRestro POS
            </h1>
            <span className="hidden sm:inline bg-white/20 text-xs px-3 py-1 rounded-full">
              {currentUser?.role}
            </span>
          </div>

          {/* Right: User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
            >
              <div className="h-9 w-9 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:flex flex-col items-start text-white text-sm">
                <span className="font-semibold leading-tight">
                  {currentUser?.fullName}
                </span>
                <span className="text-xs opacity-80">
                  {currentUser?.role}
                </span>
              </div>
              <span className="text-white text-sm">▼</span>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="px-5 py-4 border-b">
                  <p className="font-bold text-gray-800">
                    {currentUser?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentUser?.role}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-5 py-3 hover:bg-gray-100 text-gray-700"
                >
                  👤 Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 hover:bg-red-50 text-red-600 font-semibold"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
