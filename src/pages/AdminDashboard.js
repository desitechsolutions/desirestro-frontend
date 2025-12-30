import React from 'react';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-amber-700">Today's Sales</h3>
            <p className="text-3xl font-bold mt-2">₹0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-amber-700">Active Tables</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-amber-700">Low Stock Items</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;