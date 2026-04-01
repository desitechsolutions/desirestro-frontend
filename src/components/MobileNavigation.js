import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const MobileNavigation = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getNavigationItems = () => {
    if (!user) return [];

    const role = user.role;
    const items = [];

    if (role === 'ADMIN') {
      items.push(
        { path: '/admin', icon: '📊', label: t('nav.dashboard') },
        { path: '/admin/menu', icon: '📋', label: t('nav.menu') },
        { path: '/admin/tables', icon: '🪑', label: 'Tables' },
        { path: '/admin/staff', icon: '👥', label: 'Staff' },
        { path: '/admin/inventory', icon: '📦', label: t('nav.inventory') },
        { path: '/admin/sales', icon: '💰', label: t('nav.reports') }
      );
    } else if (role === 'CAPTAIN') {
      items.push(
        { path: '/captain', icon: '🏠', label: t('nav.home') },
        { path: '/captain/orders', icon: '📝', label: t('nav.orders') }
      );
    } else if (role === 'KITCHEN') {
      items.push(
        { path: '/kitchen', icon: '👨‍🍳', label: t('nav.kitchen') }
      );
    } else if (role === 'CASHIER') {
      items.push(
        { path: '/cashier', icon: '💳', label: t('nav.billing') }
      );
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {navigationItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive(item.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col items-center justify-center flex-1 h-full text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="text-2xl mb-1">☰</span>
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="md:hidden fixed right-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.username}</h3>
                  <p className="text-sm text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-4 py-3 transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileNavigation;

// Made with Bob
