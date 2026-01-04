// src/pages/CaptainHome.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';

const CaptainHome = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [categories, setCategories] = useState([]); // ← Always array
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [newPartySeats, setNewPartySeats] = useState(1);
  const [readyKOTs, setReadyKOTs] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await fetchTables();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    const tableInterval = setInterval(fetchTables, 10000);
    fetchReadyKOTs();
    const readyInterval = setInterval(fetchReadyKOTs, 10000);

    return () => {
      clearInterval(tableInterval);
      clearInterval(readyInterval);
    };
  }, []);

  const fetchReadyKOTs = async () => {
    try {
      const res = await API.get('/api/kot/ready');
      const newReady = Array.isArray(res.data) ? res.data : [];

      if (newReady.length > readyKOTs.length) {
        const audio = new Audio('/kot-beep.mp3');
        audio.volume = 0.7;
        audio.play().catch(() => {});
      }

      setReadyKOTs(newReady);
    } catch (err) {
      console.error('Error fetching ready KOTs', err);
    }
  };

  const markAsServed = async (kotId) => {
    try {
      await API.patch(`/api/kot/${kotId}/served`);
      fetchReadyKOTs();
    } catch (err) {
      alert('Failed to mark as served');
      console.error(err);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await API.get('/api/tables');
      setTables(Array.isArray(res.data) ? res.data : []);
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
      const cats = Array.isArray(res.data) ? res.data : [];
      setCategories(cats);
      if (cats.length > 0 && !activeCategory) {
        setActiveCategory(cats[0].id);
      }
    } catch (err) {
      console.error('Error fetching menu', err);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      fetchParties();
      fetchMenu();
    }
  }, [selectedTable]);

  const fetchParties = async () => {
    try {
      const res = await API.get(`/api/parties/table/${selectedTable.id}`);
      const activeParties = Array.isArray(res.data) ? res.data : [];
      setParties(activeParties.filter(p => p.status === 'ACTIVE'));
    } catch (err) {
      console.error(err);
      setParties([]);
    }
  };

  const createParty = async () => {
    if (newPartySeats < 1 || newPartySeats > selectedTable.capacity) {
      alert('Invalid number of seats');
      return;
    }
    try {
      const res = await API.post(`/api/parties/table/${selectedTable.id}`, {
        occupiedSeats: newPartySeats
      });
      setParties(prev => [...prev, res.data]);
      setShowCreateParty(false);
      setNewPartySeats(1);
    } catch (err) {
      alert('Failed to create party');
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const getTotal = () => {
    return cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);
  };

  const printKOT = (kotResponse) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT ${kotResponse.kotNumber}</title>
          <style>
            @media print {
              body { font-family: monospace; font-size: 12px; width: 80mm; margin: 0; padding: 10px; }
              .center { text-align: center; }
              .large { font-size: 18px; font-weight: bold; }
              .line { border-top: 1px dashed black; margin: 10px 0; }
              @page { margin: 0; size: 80mm auto; }
            }
          </style>
        </head>
        <body>
          <div class="center large">DESIRESTRO</div>
          <div class="center">KOT ${kotResponse.kotNumber}</div>
          <div class="line"></div>
          <div>Table: ${selectedTable.tableNumber} • Party: ${selectedParty.id}</div>
          <div>Time: ${new Date().toLocaleString()}</div>
          <div class="line"></div>
          ${kotResponse.items.map(item => `
            <div><strong>${item.quantity} × ${item.menuItemName}</strong></div>
            ${item.notes ? `<div>Notes: ${item.notes}</div>` : ''}
          `).join('')}
          <div class="line"></div>
          <div class="center">*** THANK YOU ***</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
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
      notes: ""
    }));

    try {
      const response = await API.post(`/api/kot/party/${selectedParty.id}`, { items });
      alert(`KOT #${response.data.kotNumber} sent successfully!`);
      printKOT(response.data);
      setCart([]);
    } catch (err) {
      console.error('Failed to send KOT:', err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to send KOT: ${msg}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EMPTY': return 'bg-green-100 border-green-600 hover:bg-green-200';
      case 'PARTIALLY_OCCUPIED': return 'bg-yellow-100 border-yellow-600 hover:bg-yellow-200';
      case 'FULL': return 'bg-amber-100 border-amber-600 hover:bg-amber-200';
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  // Safe way to get current category items
  const currentCategoryItems = categories
    .find(cat => cat.id === activeCategory)
    ?.items || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h2 className="text-4xl font-bold text-center text-amber-700 mb-10">Table Floor Plan</h2>

        {/* FOOD READY ALERT PANEL */}
        {readyKOTs.length > 0 && (
          <div className="mb-16 bg-gradient-to-r from-green-100 to-emerald-100 border-8 border-green-600 rounded-3xl shadow-3xl p-10 animate-pulse">
            <h3 className="text-5xl font-bold text-center text-green-800 mb-8 flex items-center justify-center gap-6">
              🔔 FOOD READY TO SERVE ({readyKOTs.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {readyKOTs.map(kot => (
                <div key={kot.id} className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-green-500">
                  <div className="text-3xl font-bold text-green-700 mb-4">
                    Table {kot.party?.table?.tableNumber || '??'} • Party {kot.party?.id || '??'}
                  </div>
                  <div className="text-xl text-gray-700 mb-6">
                    KOT #{kot.kotNumber}
                  </div>
                  <div className="space-y-3 mb-8">
                    {(kot.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xl">
                        <span>{item.quantity} × {item.menuItemName}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => markAsServed(kot.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl text-3xl font-bold shadow-2xl"
                  >
                    MARK AS SERVED
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Grid */}
        {loading ? (
          <div className="text-center py-32 text-2xl">Loading tables...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {tables.map(table => (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-12 rounded-3xl shadow-2xl border-8 text-center cursor-pointer transition transform hover:scale-110 ${getStatusColor(table.status)}`}
              >
                <div className="text-5xl font-bold text-gray-800">{table.tableNumber}</div>
                <div className="text-2xl mt-4 font-semibold">{table.status.replace('_', ' ')}</div>
                <div className="text-lg text-gray-600 mt-2">
                  {table.occupiedSeats || 0}/{table.capacity} seats
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table Selected — Show Parties */}
      {selectedTable && !selectedParty && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-3xl p-10 max-w-2xl w-full">
            <h3 className="text-4xl font-bold text-amber-700 mb-8 text-center">
              Table {selectedTable.tableNumber} — Active Parties
            </h3>

            {parties.length === 0 ? (
              <p className="text-center text-xl text-gray-600 mb-8">No active parties yet</p>
            ) : (
              <div className="space-y-4 mb-8">
                {parties.map(party => (
                  <button
                    key={party.id}
                    onClick={() => setSelectedParty(party)}
                    className="w-full bg-amber-100 hover:bg-amber-200 p-6 rounded-2xl text-left text-2xl font-semibold shadow-lg transition"
                  >
                    Party {party.id} — {party.occupiedSeats} seat{party.occupiedSeats > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowCreateParty(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl text-3xl font-bold shadow-2xl mb-4"
            >
              + New Party
            </button>

            <button
              onClick={() => setSelectedTable(null)}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white py-4 rounded-xl text-xl"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Create New Party Modal */}
      {showCreateParty && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 shadow-3xl">
            <h3 className="text-3xl font-bold mb-6">New Party at {selectedTable.tableNumber}</h3>
            <input
              type="number"
              min="1"
              max={selectedTable.capacity}
              value={newPartySeats}
              onChange={(e) => setNewPartySeats(parseInt(e.target.value) || 1)}
              className="w-full px-6 py-4 text-2xl border-2 border-amber-400 rounded-xl mb-6"
              placeholder="Number of seats"
            />
            <div className="flex gap-4">
              <button
                onClick={createParty}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-2xl font-bold"
              >
                Create Party
              </button>
              <button
                onClick={() => {
                  setShowCreateParty(false);
                  setNewPartySeats(1);
                }}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-4 rounded-xl text-2xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {selectedParty && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-3xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-10 border-b-4 border-amber-300">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-bold text-amber-800">
                  Ordering for Party {selectedParty.id} — Table {selectedTable.tableNumber}
                </h3>
                <button
                  onClick={() => {
                    setSelectedParty(null);
                    setCart([]);
                    setActiveCategory(null);
                  }}
                  className="text-5xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-10">
              {/* Category Tabs */}
              <div className="flex overflow-x-auto gap-2 mb-10 pb-4 border-b-4 border-amber-200">
                {categories.length === 0 ? (
                  <p className="text-2xl text-gray-600">No categories available</p>
                ) : (
                  categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-10 py-5 text-2xl font-bold rounded-t-3xl transition whitespace-nowrap ${
                        activeCategory === cat.id
                          ? 'bg-amber-600 text-white shadow-2xl'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))
                )}
              </div>

              {/* Menu Items */}
              {currentCategoryItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-3xl text-gray-600">
                    {activeCategory ? 'No items in this category' : 'Select a category to view items'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {currentCategoryItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-white to-amber-50 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition transform hover:-translate-y-3"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-3xl font-bold flex items-center gap-4">
                            {item.name}
                            {item.veg ? (
                              <span className="w-8 h-8 border-4 border-green-600 rounded-lg"></span>
                            ) : (
                              <span className="w-8 h-8 border-4 border-red-600 rounded-lg bg-red-100"></span>
                            )}
                          </h4>
                          <p className="text-gray-600 mt-3 text-lg">{item.description}</p>
                        </div>
                        <div className="text-4xl font-bold text-amber-700">₹{item.price}</div>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 rounded-2xl text-2xl font-bold shadow-xl transition"
                      >
                        Add to Order
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Cart */}
              {cart.length > 0 && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-10 rounded-3xl shadow-2xl">
                  <h4 className="text-4xl font-bold mb-8">Current Order</h4>
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-6 border-b-2 border-amber-300">
                        <div>
                          <span className="text-2xl font-bold">{item.quantity} × {item.name}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-6">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-16 h-16 rounded-full bg-red-300 hover:bg-red-400 text-4xl">−</button>
                            <span className="text-3xl font-bold w-20 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-16 h-16 rounded-full bg-green-300 hover:bg-green-400 text-4xl">+</button>
                          </div>
                          <span className="text-3xl font-bold text-amber-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right mt-10">
                    <div className="text-5xl font-bold text-amber-800">
                      Total: ₹{getTotal()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-8 mt-12">
                <button
                  onClick={() => setCart([])}
                  className="px-16 py-8 bg-gray-500 hover:bg-gray-600 text-white text-3xl font-bold rounded-3xl shadow-2xl"
                >
                  Clear Order
                </button>
                <button
                  onClick={sendToKitchen}
                  className="px-20 py-8 bg-green-600 hover:bg-green-700 text-white text-4xl font-bold rounded-3xl shadow-3xl transition transform hover:scale-110"
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