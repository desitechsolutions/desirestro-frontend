// src/pages/admin/CustomerAnalyticsPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTopCustomersReport } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import ExportButtons from '../../components/reports/ExportButtons';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CustomerAnalyticsPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId;

  const [customerReport, setCustomerReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date range state
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [topLimit, setTopLimit] = useState(10);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const fetchCustomerReport = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTopCustomersReport(restaurantId, startDate, endDate, topLimit);
      setCustomerReport(response.data);
    } catch (err) {
      console.error('Error fetching customer report:', err);
      setError(err.response?.data?.message || 'Failed to load customer analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerReport();
  }, [restaurantId]);

  const handleGenerateReport = () => {
    fetchCustomerReport();
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
            onClick={fetchCustomerReport}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const topCustomers = customerReport?.topCustomers || [];
  const totalCustomers = customerReport?.totalCustomers || 0;
  const totalRevenue = customerReport?.totalRevenue || 0;
  const averageOrderValue = customerReport?.averageOrderValue || 0;
  const repeatCustomerRate = customerReport?.repeatCustomerRate || 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Customer Analytics</h1>
        <p className="text-gray-600">Analyze customer behavior and identify top performers</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
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
          <div className="min-w-[150px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Top Customers</label>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>
          <button
            onClick={handleGenerateReport}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg transition"
          >
            Generate Report
          </button>
          <ExportButtons
            restaurantId={restaurantId}
            reportType="customer-analytics"
            params={{ startDate, endDate, limit: topLimit }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-2">Total Customers</p>
          <p className="text-4xl font-bold">{totalCustomers}</p>
          <p className="text-xs opacity-75 mt-2">Unique customers served</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-2">Total Revenue</p>
          <p className="text-4xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs opacity-75 mt-2">From all customers</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-2">Avg Order Value</p>
          <p className="text-4xl font-bold">{formatCurrency(averageOrderValue)}</p>
          <p className="text-xs opacity-75 mt-2">Per transaction</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm opacity-90 mb-2">Repeat Rate</p>
          <p className="text-4xl font-bold">{repeatCustomerRate.toFixed(1)}%</p>
          <p className="text-xs opacity-75 mt-2">Customer retention</p>
        </div>
      </div>

      {/* Top Customers Chart */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Customers by Revenue</h2>
        {topCustomers.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topCustomers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis dataKey="customerName" type="category" width={150} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'totalRevenue') return [formatCurrency(value), 'Revenue'];
                  return [value, name];
                }}
              />
              <Bar dataKey="totalRevenue" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      {/* Customer Details Table */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Details</h2>
        {topCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{customer.customerName}</div>
                      {customer.email && (
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{customer.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-blue-600">{customer.orderCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-600">{formatCurrency(customer.totalRevenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{formatCurrency(customer.averageOrderValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                      {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        customer.orderCount >= 10 ? 'bg-purple-100 text-purple-800' :
                        customer.orderCount >= 5 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.orderCount >= 10 ? 'VIP' : customer.orderCount >= 5 ? 'Regular' : 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      {/* Customer Segmentation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-800">VIP Customers</h3>
            <span className="text-3xl">👑</span>
          </div>
          <p className="text-4xl font-bold text-purple-600 mb-2">
            {topCustomers.filter(c => c.orderCount >= 10).length}
          </p>
          <p className="text-sm text-purple-700">10+ orders</p>
          <p className="text-xs text-purple-600 mt-2">
            {formatCurrency(topCustomers.filter(c => c.orderCount >= 10).reduce((sum, c) => sum + c.totalRevenue, 0))} revenue
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-800">Regular Customers</h3>
            <span className="text-3xl">⭐</span>
          </div>
          <p className="text-4xl font-bold text-blue-600 mb-2">
            {topCustomers.filter(c => c.orderCount >= 5 && c.orderCount < 10).length}
          </p>
          <p className="text-sm text-blue-700">5-9 orders</p>
          <p className="text-xs text-blue-600 mt-2">
            {formatCurrency(topCustomers.filter(c => c.orderCount >= 5 && c.orderCount < 10).reduce((sum, c) => sum + c.totalRevenue, 0))} revenue
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">New Customers</h3>
            <span className="text-3xl">🌟</span>
          </div>
          <p className="text-4xl font-bold text-gray-600 mb-2">
            {topCustomers.filter(c => c.orderCount < 5).length}
          </p>
          <p className="text-sm text-gray-700">1-4 orders</p>
          <p className="text-xs text-gray-600 mt-2">
            {formatCurrency(topCustomers.filter(c => c.orderCount < 5).reduce((sum, c) => sum + c.totalRevenue, 0))} revenue
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-blue-800 mb-3">💡 Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Your top {topCustomers.length} customers contribute{' '}
              <strong>{formatCurrency(topCustomers.reduce((sum, c) => sum + c.totalRevenue, 0))}</strong> in revenue
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Repeat customer rate of <strong>{repeatCustomerRate.toFixed(1)}%</strong> indicates{' '}
              {repeatCustomerRate >= 50 ? 'excellent' : repeatCustomerRate >= 30 ? 'good' : 'room for improvement in'} customer loyalty
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Average order value is <strong>{formatCurrency(averageOrderValue)}</strong> - consider upselling strategies
            </span>
          </li>
          {topCustomers.length > 0 && (
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>{topCustomers[0].customerName}</strong> is your top customer with{' '}
                <strong>{formatCurrency(topCustomers[0].totalRevenue)}</strong> in revenue
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CustomerAnalyticsPage;

// Made with Bob
