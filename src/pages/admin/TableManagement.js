// src/pages/admin/TableManagement.js

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../components/common/Toast';

const TableManagement = () => {
  const toast = useToast();
  const [tables, setTables] = useState([]);
  const [editingTable, setEditingTable] = useState(null);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await API.get('/api/tables');
      setTables(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTable = async () => {
    if (!newTable.tableNumber || newTable.capacity <= 0) {
      toast.error('Please enter valid table number and capacity');
      return;
    }
    try {
      const res = await API.post('/api/tables', {
        tableNumber: newTable.tableNumber,
        capacity: newTable.capacity,
        status: 'EMPTY',
        occupiedSeats: 0
      });
      setTables(prev => [...prev, res.data]);
      setNewTable({ tableNumber: '', capacity: 0 });
      toast.success('Table added!');
    } catch (err) {
      toast.error('Failed — number may exist');
    }
  };

  const updateTable = async () => {
    try {
      const res = await API.put(`/api/tables/${editingTable.id}`, editingTable);
      setTables(prev => prev.map(t => t.id === editingTable.id ? res.data : t));
      setEditingTable(null);
      toast.success('Table updated!');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const deleteTable = async (id) => {
    if (!window.confirm('Delete table?')) return;
    try {
      await API.delete(`/api/tables/${id}`);
      setTables(prev => prev.filter(t => t.id !== id));
      toast.success('Table deleted');
    } catch (err) {
      toast.error('Cannot delete occupied table');
    }
  };

  if (loading) return <div className="text-center py-40 text-4xl text-gray-600">Loading tables...</div>;

  return (
    <>
      <h2 className="text-5xl font-bold text-center text-amber-800 mb-16">
        Table Management
      </h2>

      <div className="bg-white p-12 rounded-3xl shadow-3xl mb-16">
        <h3 className="text-4xl font-bold text-gray-800 mb-10">Add New Table</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <input type="text" placeholder="Table Number" value={newTable.tableNumber} onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value.toUpperCase() })} className="px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl" />
          <input type="number" placeholder="Capacity" value={newTable.capacity || ''} onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 0 })} className="px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl" />
        </div>
        <button onClick={createTable} className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-8 rounded-2xl text-4xl font-bold">
          + ADD NEW TABLE
        </button>
      </div>

      <h3 className="text-4xl font-bold text-gray-800 mb-10 text-center">
        Current Tables ({tables.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {tables.map(table => (
          <div key={table.id} className="bg-white p-10 rounded-3xl shadow-3xl border-4 border-gray-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-4xl font-bold text-amber-800">{table.tableNumber}</h4>
                <p className="text-2xl text-gray-600 mt-4">Capacity: {table.capacity} seats</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-700">{table.status.replace('_', ' ')}</p>
                <p className="text-xl text-gray-600 mt-2">{table.occupiedSeats || 0}/{table.capacity} occupied</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setEditingTable(table)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-2xl font-bold">
                Edit
              </button>
              <button onClick={() => deleteTable(table.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl text-2xl font-bold">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-4xl p-12 max-w-2xl w-full">
            <h3 className="text-4xl font-bold text-amber-800 mb-10 text-center">
              Edit Table {editingTable.tableNumber}
            </h3>
            <div className="space-y-8">
              <input type="text" value={editingTable.tableNumber} onChange={(e) => setEditingTable({ ...editingTable, tableNumber: e.target.value.toUpperCase() })} className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl" />
              <input type="number" value={editingTable.capacity} onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 0 })} className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl" />
            </div>
            <div className="flex gap-6 mt-12">
              <button onClick={updateTable} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl text-3xl font-bold">
                Save Changes
              </button>
              <button onClick={() => setEditingTable(null)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-6 rounded-2xl text-3xl font-bold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TableManagement;