// src/pages/AdminDashboard.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import SalesDashboard from './admin/SalesDashboard';
import InventoryDashboard from './admin/InventoryDashboard';
import TableManagement from './admin/TableManagement';
import MenuManagement from './admin/MenuManagement';
import StaffManagement from './admin/StaffManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-5xl font-bold text-center text-amber-800 mb-12">
          {t('admin.title')} — DesiRestro
        </h1>

        <div className="flex justify-center mb-16">
          <div className="bg-white rounded-3xl shadow-2xl p-4 flex flex-wrap gap-6 justify-center">
            <button onClick={() => setActiveTab('sales')} className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${activeTab === 'sales' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📊 {t('admin.salesTab')}
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${activeTab === 'inventory' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📦 {t('admin.inventoryTab')}
            </button>
            <button onClick={() => setActiveTab('tables')} className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${activeTab === 'tables' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              🛋️ {t('admin.tablesTab')}
            </button>
            <button onClick={() => setActiveTab('menu')} className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${activeTab === 'menu' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              🍽️ {t('admin.menuTab')}
            </button>
            <button
                onClick={() => setActiveTab('staff')}
                className={`px-16 py-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 ${
                    activeTab === 'staff'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                >
                👥 {t('admin.staffTab')}
            </button>
          </div>
        </div>

        {activeTab === 'sales' && (
          <div>
            {/* Report Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <a
                href="/admin/reports/sales"
                className="block bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-white"
              >
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-bold mb-2">{t('admin.salesReports')}</h3>
                <p className="text-sm opacity-90">Daily, monthly & comparative analysis</p>
              </a>
              
              <a
                href="/admin/reports/items"
                className="block bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-white"
              >
                <div className="text-4xl mb-3">🍽️</div>
                <h3 className="text-xl font-bold mb-2">{t('admin.itemReports')}</h3>
                <p className="text-sm opacity-90">Top sellers, slow movers & categories</p>
              </a>
              
              <a
                href="/admin/reports/gst"
                className="block bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-white"
              >
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-xl font-bold mb-2">{t('admin.gstReports')}</h3>
                <p className="text-sm opacity-90">GSTR-1 format & tax compliance</p>
              </a>
              
              <a
                href="/admin/reports/customers"
                className="block bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-white"
              >
                <div className="text-4xl mb-3">👥</div>
                <h3 className="text-xl font-bold mb-2">{t('admin.customerAnalytics')}</h3>
                <p className="text-sm opacity-90">Top customers & behavior analysis</p>
              </a>
            </div>
            
            <SalesDashboard />
          </div>
        )}
        {activeTab === 'inventory' && <InventoryDashboard />}
        {activeTab === 'tables' && <TableManagement />}
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'staff' && <StaffManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;