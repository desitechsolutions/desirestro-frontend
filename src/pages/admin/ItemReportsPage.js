// src/pages/admin/ItemReportsPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getItemSalesReport, getCategorySalesReport } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import ExportButtons from '../../components/reports/ExportButtons';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#ef4444'];

const ItemReportsPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId;

  const [itemReport, setItemReport] = useState(null);
  const [categoryReport, setCategoryReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date range state
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const fetchReports = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [itemRes, categoryRes] = await Promise.all([
        getItemSalesReport(restaurantId, startDate, endDate),
        getCategorySalesReport(restaurantId, startDate, endDate)
      ]);
      
      setItemReport(itemRes.data);
      setCategoryReport(categoryRes.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [restaurantId]);

  const handleGenerateReport = () => {
    fetchReports();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const topItems = itemReport?.topSellingItems || [];
  const slowItems = itemReport?.slowMovingItems || [];
  const categories = categoryReport?.categories || [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Item Sales Reports</h1>
        <p className="text-gray-600">Analyze item-wise and category-wise sales performance</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={today}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg transition"
          >
            Generate Report
          </button>
          <ExportButtons
            restaurantId={restaurantId}
            reportType="item-sales"
            params={{ startDate, endDate }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-2">Total Items Sold</p>
          <p className="text-4xl font-bold">{itemReport?.totalItemsSold || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-2">Total Revenue</p>
          <p className="text-4xl font-bold">{formatCurrency(itemReport?.totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-2">Unique Items</p>
          <p className="text-4xl font-bold">{itemReport?.uniqueItems || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-2">Avg Item Price</p>
          <p className="text-4xl font-bold">{formatCurrency(itemReport?.averageItemPrice)}</p>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Selling Items</h2>
        {topItems.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topItems.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="itemName" angle={-45} textAnchor="end" height={120} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                    return [value, 'Quantity'];
                  }}
                />
                <Bar yAxisId="left" dataKey="quantitySold" fill="#3b82f6" name="Quantity" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.itemName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600 font-semibold">{item.quantitySold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-semibold">{formatCurrency(item.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{formatCurrency(item.averagePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Category Distribution</h2>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Category Performance</h2>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={index} className="border-l-4 p-4 rounded-lg hover:bg-gray-50 transition" style={{ borderColor: COLORS[index % COLORS.length] }}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{category.categoryName}</h3>
                    <span className="text-sm font-medium text-gray-600">{category.itemCount} items</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Quantity Sold</p>
                      <p className="font-bold text-blue-600">{category.quantitySold}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-bold text-green-600">{formatCurrency(category.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Slow Moving Items */}
      {slowItems.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">⚠️ Slow Moving Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-red-600 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-red-600 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slowItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{item.quantitySold}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{formatCurrency(item.revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Review Pricing
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemReportsPage;

// Made with Bob
