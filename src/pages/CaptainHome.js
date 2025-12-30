// src/pages/CaptainHome.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';

const CaptainHome = () => {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentGuest, setCurrentGuest] = useState(1); // Current guest being ordered for

  // Auto-refresh tables every 10 seconds + initial load
  useEffect(() => {
    fetchTables();
    fetchMenu();

    const interval = setInterval(fetchTables, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await API.get('/api/tables');
      setTables(res.data);
    } catch (err) {
      console.error('Error fetching tables', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await API.get('/api/menu/categories');
      const cats = res.data;
      setCategories(cats);
      if (cats.length > 0 && !activeCategory) {
        setActiveCategory(cats[0].id); // Set first category as active on load
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu', err);
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const itemWithGuest = {
      ...item,
      quantity: 1,
      guestNumber: currentGuest,
      key: `${item.id}-${currentGuest}` // Unique key per item + guest
    };

    setCart(prev => {
      const existing = prev.find(i => i.key === itemWithGuest.key);
      if (existing) {
        return prev.map(i => 
          i.key === itemWithGuest.key 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      }
      return [...prev, itemWithGuest];
    });
  };

  const updateQuantity = (key, delta) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.key === key) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const getTotal = () => {
    return cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);
  };

  const sendToKitchen = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const items = cart.map(item => ({
      menuItemId: item.id,
      menuItemName: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: "",
      guestNumber: item.guestNumber
    }));

    try {
      await API.post('/api/kot', {
        tableId: selectedTable.id,
        items: items
      });

      alert(`KOT sent successfully for Table ${selectedTable.tableNumber}!`);
      setCart([]);
      setCurrentGuest(1);
      setSelectedTable(null);
      fetchTables(); // Immediate refresh
    } catch (err) {
      console.error('KOT send error:', err);
      alert(`Error: ${err.response?.status || 'Network'} - Failed to send KOT`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EMPTY': return 'bg-green-100 border-green-500 hover:bg-green-200';
      case 'OCCUPIED': return 'bg-amber-100 border-amber-500 hover:bg-amber-200';
      case 'BILLING': return 'bg-blue-100 border-blue-500 hover:bg-blue-200';
      case 'DIRTY': return 'bg-red-100 border-red-500 hover:bg-red-200';
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Table Floor Plan</h2>

        {loading ? (
          <div className="text-center py-20 text-xl">Loading tables & menu...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {tables.map(table => (
              <div
                key={table.id}
                onClick={() => {
                  setSelectedTable(table);
                  setCurrentGuest(1);
                  setCart([]);
                }}
                className={`p-8 rounded-2xl shadow-2xl border-4 text-center cursor-pointer transition transform hover:scale-105 ${getStatusColor(table.status)}`}
              >
                <div className="text-4xl font-bold text-gray-800">{table.tableNumber}</div>
                <div className="text-lg text-gray-600 mt-2">{table.seats} seats</div>
                <div className="text-sm uppercase font-bold mt-4 text-gray-700">{table.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-3xl w-full max-w-5xl max-h-screen overflow-y-auto">
            <div className="p-8 border-b-2 border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-bold text-amber-700">
                  Order for Table {selectedTable.tableNumber} ({selectedTable.seats} seats)
                </h3>
                <button
                  onClick={() => {
                    setSelectedTable(null);
                    setCart([]);
                    setCurrentGuest(1);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-4xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Guest Selector */}
              <div className="mb-10 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
                <h4 className="text-2xl font-bold text-gray-800 mb-6">Ordering for:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[...Array(selectedTable.seats)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentGuest(i + 1)}
                      className={`py-6 rounded-2xl font-bold text-2xl transition-all transform shadow-xl ${
                        currentGuest === i + 1
                          ? 'bg-amber-600 text-white scale-110'
                          : 'bg-white text-amber-700 hover:bg-amber-100 hover:scale-105'
                      }`}
                    >
                      Guest {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex space-x-2 border-b-4 border-amber-200 mb-8 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-8 py-4 font-bold text-lg rounded-t-2xl transition-all whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Menu Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {categories
                  .find(cat => cat.id === activeCategory)
                  ?.items.map(item => (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-bold text-2xl flex items-center gap-3">
                            {item.name}
                            {item.veg ? (
                              <span className="w-6 h-6 border-3 border-green-600 rounded-md"></span>
                            ) : (
                              <span className="w-6 h-6 border-3 border-red-600 rounded-md bg-red-100"></span>
                            )}
                          </div>
                          <div className="text-gray-600 mt-2">{item.description}</div>
                        </div>
                        <div className="text-3xl font-bold text-amber-700">₹{item.price}</div>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl font-bold text-xl transition shadow-lg hover:shadow-xl"
                      >
                        Add to Guest {currentGuest}
                      </button>
                    </div>
                  )) || (
                  <div className="col-span-full text-center text-gray-500 py-16 text-2xl">
                    No items in this category
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl shadow-xl">
                  <h4 className="text-3xl font-bold mb-6 text-gray-800">Cart Summary</h4>
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.key} className="flex justify-between items-center py-4 border-b-2 border-amber-200">
                        <div>
                          <span className="font-bold text-xl text-amber-700">Guest {item.guestNumber}</span>
                          <div className="text-lg">
                            {item.quantity} × {item.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => updateQuantity(item.key, -1)}
                              className="w-12 h-12 rounded-full bg-red-200 hover:bg-red-300 text-2xl font-bold"
                            >
                              −
                            </button>
                            <span className="text-2xl font-bold w-16 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.key, 1)}
                              className="w-12 h-12 rounded-full bg-green-200 hover:bg-green-300 text-2xl font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-2xl font-bold text-amber-700">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right mt-8">
                    <div className="text-4xl font-bold text-amber-700">
                      Total: ₹{getTotal()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-12 gap-6">
                <button
                  onClick={() => setCart([])}
                  className="px-12 py-5 bg-gray-400 hover:bg-gray-500 text-white text-xl font-bold rounded-xl transition shadow-lg"
                >
                  Clear Cart
                </button>
                <button
                  onClick={sendToKitchen}
                  className="px-16 py-6 bg-green-600 hover:bg-green-700 text-white text-3xl font-bold rounded-2xl transition shadow-2xl transform hover:scale-105"
                >
                  Send to Kitchen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptainHome;