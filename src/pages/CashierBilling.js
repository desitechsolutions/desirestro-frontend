// src/pages/CashierBilling.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';

const CashierBilling = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);

  const GST_RATE = 0.18;

  // Auto-refresh occupied tables every 10 seconds
  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await API.get('/api/tables');
      // Show tables that have at least one active party
      const occupiedTables = res.data.filter(t => 
        t.status === 'PARTIALLY_OCCUPIED' || t.status === 'FULL'
      );
      setTables(occupiedTables);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tables', err);
      setLoading(false);
    }
  };

    const printBill = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill - Party ${selectedParty.id}</title>
            <style>
            @media print {
                body { font-family: Arial, sans-serif; font-size: 12px; width: 80mm; margin: 0; padding: 10px; }
                .center { text-align: center; }
                .large { font-size: 20px; font-weight: bold; }
                .line { border-top: 2px dashed black; margin: 15px 0; }
                .right { text-align: right; }
                @page { margin: 0; size: 80mm auto; }
            }
            </style>
        </head>
        <body>
            <div class="center large">DESIRESTRO</div>
            <div class="center">Tax Invoice</div>
            <div class="center">GSTIN: 27ABCDE1234F1Z5</div>
            <div class="line"></div>
            <div>Table: ${selectedTable.tableNumber} • Party: ${selectedParty.id}</div>
            <div>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div class="line"></div>
            ${kots.map(kot => `
            <div><strong>KOT ${kot.kotNumber}</strong></div>
            ${kot.items.map(item => `
                <div class="flex justify-between">
                <span>${item.quantity} × ${item.menuItemName}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
            `).join('')}
            <div class="line"></div>
            <div class="right">
            <div>Subtotal: ₹${subtotal.toFixed(2)}</div>
            <div>CGST (9%): ₹${(gst / 2).toFixed(2)}</div>
            <div>SGST (9%): ₹${(gst / 2).toFixed(2)}</div>
            <div class="large">TOTAL: ₹${total.toFixed(2)}</div>
            </div>
            <div class="line"></div>
            <div class="center large">THANK YOU!</div>
            <div class="center">Visit Again 😊</div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    };
  const fetchPartiesForTable = async (table) => {
    try {
      const res = await API.get(`/api/parties/table/${table.id}`);
      const activeParties = res.data.filter(p => p.status === 'ACTIVE');
      setParties(activeParties);
      setSelectedTable(table);
      // Clear previous selection if table changed
      if (selectedParty && selectedParty.table?.id !== table.id) {
        setSelectedParty(null);
        setKots([]);
      }
    } catch (err) {
      console.error('Error fetching parties', err);
    }
  };

  const fetchKOTsForParty = async (party) => {
    try {
      const res = await API.get(`/api/kot/party/${party.id}`);
      setKots(res.data);
      setSelectedParty(party);
    } catch (err) {
      console.error('Error fetching KOTs', err);
    }
  };

  const calculateSubtotal = () => {
    return kots.flatMap(kot => kot.items || [])
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  const settleBill = async () => {
    if (!window.confirm(`Settle bill for Party ${selectedParty.id}?\nTotal: ₹${total.toFixed(2)}`)) {
      return;
    }

    try {
      await API.patch(`/api/bills/party/${selectedParty.id}`, { paymentMode: 'CASH' });

      alert('Bill settled successfully! Party closed.');

      // FULL UI RESET — clear everything
      setSelectedParty(null);
      setKots([]);
      setParties([]); // Will be refetched on next table click

      // Refresh tables list immediately
      await fetchTables();

      // If no more active parties on this table, close table view
      if (parties.length <= 1) { // only current one was active
        setSelectedTable(null);
      }
    } catch (err) {
      console.error('Settle error:', err);
      alert('Failed to settle bill');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h2 className="text-4xl font-bold text-center text-amber-700 mb-12">
          Cashier Billing
        </h2>

        {loading ? (
          <div className="text-center py-32 text-2xl text-gray-600">Loading tables...</div>
        ) : tables.length === 0 ? (
          <div className="text-center py-32 text-4xl text-gray-600 font-semibold">
            No occupied tables — All clear! 🎉
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10 mb-16">
            {tables.map(table => (
              <div
                key={table.id}
                onClick={() => fetchPartiesForTable(table)}
                className="bg-gradient-to-br from-amber-100 to-orange-100 border-8 border-amber-600 p-12 rounded-3xl shadow-3xl text-center cursor-pointer transition transform hover:scale-110 hover:shadow-4xl"
              >
                <div className="text-6xl font-bold text-amber-800">{table.tableNumber}</div>
                <div className="text-2xl font-semibold text-gray-700 mt-6">
                  {table.status.replace('_', ' ')}
                </div>
                <div className="text-xl text-gray-600 mt-4">
                  {table.occupiedSeats || 0}/{table.capacity} seats
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Parties List */}
        {selectedTable && !selectedParty && parties.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-4xl p-12 max-w-2xl w-full">
              <h3 className="text-4xl font-bold text-amber-700 mb-10 text-center">
                Active Parties — Table {selectedTable.tableNumber}
              </h3>

              <div className="space-y-6 mb-10">
                {parties.map(party => (
                  <button
                    key={party.id}
                    onClick={() => fetchKOTsForParty(party)}
                    className="w-full bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 p-8 rounded-2xl text-left text-3xl font-bold shadow-2xl transition transform hover:scale-105"
                  >
                    Party {party.id} — {party.occupiedSeats} seat{party.occupiedSeats > 1 ? 's' : ''}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedTable(null)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-6 rounded-2xl text-2xl font-bold"
              >
                Back to Tables
              </button>
            </div>
          </div>
        )}

        {/* Bill View */}
        {selectedParty && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-4xl p-12 max-w-5xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-12 border-b-4 pb-8">
                <h3 className="text-5xl font-bold text-amber-800">
                  Final Bill — Party {selectedParty.id}
                  <span className="block text-3xl mt-2">Table {selectedTable.tableNumber}</span>
                </h3>
                <button
                  onClick={() => {
                    setSelectedParty(null);
                    setKots([]);
                  }}
                  className="text-6xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-8 mb-12">
                {kots.length === 0 ? (
                  <p className="text-center text-2xl text-gray-600 py-20">No orders yet</p>
                ) : (
                  kots.map(kot => (
                    <div key={kot.id} className="bg-gray-50 p-6 rounded-2xl shadow">
                      <div className="text-lg text-gray-600 mb-4">
                        KOT {kot.kotNumber} • {new Date(kot.createdAt).toLocaleTimeString()}
                      </div>
                      {kot.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-3 text-xl border-b">
                          <span>{item.quantity} × {item.menuItemName}</span>
                          <span className="font-bold text-amber-700">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-10 rounded-3xl shadow-2xl">
                <div className="text-right text-4xl space-y-4">
                  <div>Subtotal: <span className="font-bold">₹{subtotal.toFixed(2)}</span></div>
                  <div>GST (18%): <span className="font-bold">₹{gst.toFixed(2)}</span></div>
                  <div className="text-6xl mt-8 text-amber-800">
                    GRAND TOTAL: <span className="font-extrabold">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-16">
                <button
                    onClick={printBill}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold rounded-xl shadow-lg mr-6"
                >
                    🖨️ PRINT BILL
                </button>
                <button
                  onClick={settleBill}
                  className="px-24 py-10 bg-green-600 hover:bg-green-700 text-white text-5xl font-bold rounded-3xl shadow-3xl transition transform hover:scale-110"
                >
                  SETTLE BILL & FREE SEATS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierBilling;