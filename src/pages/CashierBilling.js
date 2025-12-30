// src/pages/CashierBilling.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';

const CashierBilling = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);

  const GST_RATE = 0.18; // 18% GST

  // Auto-refresh occupied tables every 10 seconds
  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await API.get('/api/tables');
      // Show only OCCUPIED tables
      setTables(res.data.filter(t => t.status === 'OCCUPIED'));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tables', err);
      setLoading(false);
    }
  };

  const fetchKOTsForTable = async (table) => {
    try {
      const res = await API.get(`/api/kot/table/${table.id}`);
      setKots(res.data);
      setSelectedTable(table);
    } catch (err) {
      console.error('Error fetching KOTs', err);
      alert('Failed to load orders for this table');
    }
  };

  // Group items by guestNumber
  const groupItemsByGuest = () => {
    const allItems = kots.flatMap(kot => kot.items);
    const grouped = {};

    allItems.forEach(item => {
      const guest = item.guestNumber || 1; // Default to Guest 1 if not set
      if (!grouped[guest]) {
        grouped[guest] = [];
      }
      grouped[guest].push(item);
    });

    return grouped;
  };

  const itemsByGuest = groupItemsByGuest();

  const calculateGuestTotal = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const calculateTableTotal = () => {
    const allItems = kots.flatMap(kot => kot.items);
    const subtotal = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const tableTotal = calculateTableTotal();

  const settleBill = async () => {
    if (window.confirm(`Settle bill for Table ${selectedTable.tableNumber}?\nGrand Total: ₹${tableTotal.total.toFixed(2)}`)) {
      try {
        await API.patch(`/api/kot/table/${selectedTable.id}/settle`);
        alert('Bill settled successfully! Table is now free.');
        setSelectedTable(null);
        setKots([]);
        fetchTables(); // Refresh list
      } catch (err) {
        console.error(err);
        alert('Failed to settle bill');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h2 className="text-4xl font-bold text-center text-amber-700 mb-10">Cashier Billing</h2>

        {loading ? (
          <div className="text-center py-32 text-2xl text-gray-600">Loading occupied tables...</div>
        ) : tables.length === 0 ? (
          <div className="text-center py-32 text-3xl text-gray-600">
            No occupied tables — All clear! 🎉
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 mb-16">
            {tables.map(table => (
              <div
                key={table.id}
                onClick={() => fetchKOTsForTable(table)}
                className="bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-amber-600 p-10 rounded-2xl shadow-2xl text-center cursor-pointer transition transform hover:scale-110 hover:shadow-3xl"
              >
                <div className="text-5xl font-bold text-amber-800">{table.tableNumber}</div>
                <div className="text-2xl font-semibold text-gray-700 mt-4">OCCUPIED</div>
                <div className="text-lg text-gray-600 mt-2">{table.seats} seats</div>
              </div>
            ))}
          </div>
        )}

        {/* Bill Details Modal */}
        {selectedTable && (
          <div className="bg-white rounded-3xl shadow-3xl p-10 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-10 border-b-2 pb-6">
              <h3 className="text-4xl font-bold text-amber-700">
                Final Bill — Table {selectedTable.tableNumber}
              </h3>
              <button
                onClick={() => {
                  setSelectedTable(null);
                  setKots([]);
                }}
                className="text-4xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-10">
              {Object.keys(itemsByGuest).sort((a, b) => a - b).map(guestNum => {
                const guestItems = itemsByGuest[guestNum];
                const { subtotal, gst, total } = calculateGuestTotal(guestItems);

                return (
                  <div key={guestNum} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 shadow-xl">
                    <h4 className="text-3xl font-bold text-amber-800 mb-6">
                      Guest {guestNum}
                    </h4>

                    <div className="space-y-4 mb-8">
                      {guestItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3 border-b border-amber-200">
                          <span className="text-xl">
                            {item.quantity} × {item.menuItemName}
                          </span>
                          <span className="text-xl font-semibold text-amber-700">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-right space-y-3 text-2xl">
                      <div>Subtotal: <span className="font-bold">₹{subtotal.toFixed(2)}</span></div>
                      <div>GST (18%): <span className="font-bold">₹{gst.toFixed(2)}</span></div>
                      <div className="text-3xl text-amber-700 mt-4">
                        Guest Total: <span className="font-bold">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grand Table Total */}
            <div className="mt-12 pt-8 border-t-4 border-amber-600 bg-amber-100 rounded-2xl p-8">
              <div className="text-right text-4xl">
                <div className="mb-4">Table Subtotal: <span className="font-bold">₹{tableTotal.subtotal.toFixed(2)}</span></div>
                <div className="mb-6">Total GST: <span className="font-bold">₹{tableTotal.gst.toFixed(2)}</span></div>
                <div className="text-5xl text-amber-800">
                  GRAND TOTAL: <span className="font-extrabold">₹{tableTotal.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <button
                onClick={settleBill}
                className="px-20 py-8 bg-green-600 hover:bg-green-700 text-white text-4xl font-bold rounded-3xl shadow-3xl transition transform hover:scale-110"
              >
                SETTLE BILL & FREE TABLE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierBilling;