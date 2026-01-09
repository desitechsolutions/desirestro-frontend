// src/pages/CaptainHome.jsx

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';

import TableGrid from '../components/captain/TableGrid';
import ReadyKOTPanel from '../components/captain/ReadyKOTPanel';
import PartyModal from '../components/captain/PartyModal';
import OrderModal from '../components/captain/OrderModal';

const CaptainHome = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [categories, setCategories] = useState([]); // Raw categories
  const [allMenuItems, setAllMenuItems] = useState([]); // Flat list of items
  const [categoriesWithItems, setCategoriesWithItems] = useState([]); // Final grouped
  const [cart, setCart] = useState([]);
  const [readyKOTs, setReadyKOTs] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTables(), fetchReadyKOTs()]);
      setLoading(false);
    };
    load();

    const interval = setInterval(() => {
      fetchTables();
      fetchReadyKOTs();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await API.get('/api/tables');
      setTables(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReadyKOTs = async () => {
    try {
      const res = await API.get('/api/kot/ready');
      const newKOTs = Array.isArray(res.data) ? res.data : [];
      if (newKOTs.length > readyKOTs.length) {
        const audio = new Audio('/kot-beep.mp3');
        audio.play().catch(() => {});
      }
      setReadyKOTs(newKOTs);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsServed = async (kotId) => {
    try {
      await API.patch(`/api/kot/${kotId}/served`);
      fetchReadyKOTs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTableSelect = async (table) => {
    setSelectedTable(table);
    setSelectedParty(null);
    setCart([]);
    setActiveCategoryId(null);

    try {
      const [partyRes, catRes, itemRes] = await Promise.all([
        API.get(`/api/parties/table/${table.id}`),
        API.get('/api/menu/categories'),
        API.get('/api/menu/items')
      ]);

      const activeParties = Array.isArray(partyRes.data)
        ? partyRes.data.filter(p => p.status === 'ACTIVE')
        : [];

      const cats = Array.isArray(catRes.data) ? catRes.data : [];
      const items = Array.isArray(itemRes.data) ? itemRes.data : [];

      setParties(activeParties);
      setCategories(cats);
      setAllMenuItems(items);

      // Group items by categoryId
      const grouped = cats.map(cat => ({
        ...cat,
        items: items.filter(item => item.categoryId === cat.id)
      }));

      setCategoriesWithItems(grouped);

      if (grouped.length > 0) {
        setActiveCategoryId(grouped[0].id);
      }
    } catch (err) {
      console.error(err);
      setCategories([]);
      setAllMenuItems([]);
      setCategoriesWithItems([]);
    }
  };

  const createParty = async (seats) => {
    try {
      const res = await API.post(`/api/parties/table/${selectedTable.id}`, {
        occupiedSeats: seats
      });
      setParties(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev =>
      prev
        .map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const sendToKitchen = async () => {
    if (cart.length === 0 || sending) return;
    setSending(true);

    try {
      const items = cart.map(i => ({
        menuItemId: i.id,
        menuItemName: i.name,
        price: i.price,
        quantity: i.quantity,
        notes: ""
      }));

      const res = await API.post(`/api/kot/party/${selectedParty.id}`, { items });
      alert(`KOT #${res.data.kotNumber} sent!`);

      const printWin = window.open('', '_blank');
      printWin.document.write(`
        <html><head><title>KOT ${res.data.kotNumber}</title>
        <style>@media print { body { font-family: monospace; font-size: 14px; width: 80mm; margin: 10px; } }</style>
        </head><body>
          <div style="text-align:center;font-weight:bold;font-size:20px;">DESIRESTRO</div>
          <div style="text-align:center;">KOT ${res.data.kotNumber}</div>
          <hr style="border:1px dashed #000;">
          <div>Table: ${selectedTable.tableNumber} • Party: ${selectedParty.id}</div>
          <div>${new Date().toLocaleString()}</div>
          <hr style="border:1px dashed #000;">
          ${items.map(i => `<div><strong>${i.quantity} × ${i.menuItemName}</strong></div>`).join('')}
          <hr style="border:1px dashed #000;">
          <div style="text-align:center;">*** THANK YOU ***</div>
        </body></html>
      `);
      printWin.document.close();
      setTimeout(() => printWin.print(), 500);

      setCart([]);
    } catch (err) {
      alert('Failed to send KOT');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-4xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-5xl font-bold text-center text-amber-800 mb-12">
          Captain Dashboard
        </h2>

        <ReadyKOTPanel readyKOTs={readyKOTs} onServed={markAsServed} />

        <TableGrid
          tables={tables}
          selectedTable={selectedTable}
          onSelect={handleTableSelect}
        />
      </div>

      {selectedTable && !selectedParty && (
        <PartyModal
          table={selectedTable}
          parties={parties}
          onSelect={setSelectedParty}
          onCreate={createParty}
          onClose={() => {
            setSelectedTable(null);
            setCategoriesWithItems([]);
            setActiveCategoryId(null);
          }}
        />
      )}

      {selectedParty && (
        <OrderModal
          party={selectedParty}
          table={selectedTable}
          categories={categoriesWithItems}  // ← Now has .items
          cart={cart}
          activeCategoryId={activeCategoryId}
          onCategoryChange={setActiveCategoryId}
          onAdd={addToCart}
          onQty={updateQuantity}
          onSend={sendToKitchen}
          sending={sending}
          onClose={() => {
            setSelectedParty(null);
            setCart([]);
            setActiveCategoryId(null);
          }}
        />
      )}
    </div>
  );
};

export default CaptainHome;