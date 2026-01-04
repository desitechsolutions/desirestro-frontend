// src/pages/AdminDashboard.js

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SalesDashboard from './admin/SalesDashboard';
import InventoryDashboard from './admin/InventoryDashboard';
import TableManagement from './admin/TableManagement';
import MenuManagement from './admin/MenuManagement';
import StaffManagement from './admin/StaffManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-5xl font-bold text-center text-amber-800 mb-12">
          Admin Control Center — DesiRestro
        </h1>

        <div className="flex justify-center mb-16">
          <div className="bg-white rounded-3xl shadow-2xl p-4 flex flex-wrap gap-6 justify-center">
            <button onClick={() => setActiveTab('sales')} className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${activeTab === 'sales' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📊 Sales & Reports
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${activeTab === 'inventory' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📦 Inventory
            </button>
            <button onClick={() => setActiveTab('tables')} className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${activeTab === 'tables' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              🛋️ Tables
            </button>
            <button onClick={() => setActiveTab('menu')} className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${activeTab === 'menu' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              🍽️ Menu
            </button>
            <button
                onClick={() => setActiveTab('staff')}
                className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${
                    activeTab === 'staff'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                >
                👥 Staff
            </button>
          </div>
        </div>

        {activeTab === 'sales' && <SalesDashboard />}
        {activeTab === 'inventory' && <InventoryDashboard />}
        {activeTab === 'tables' && <TableManagement />}
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'staff' && <StaffManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;