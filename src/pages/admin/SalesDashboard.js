// src/pages/admin/SalesDashboard.js

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../services/api';

const SalesDashboard = () => {
  const [todayStats, setTodayStats] = useState({ revenue: 0, bills: 0, avgBill: 0, orders: 0 });
  const [topItems, setTopItems] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const todayRes = await API.get('/api/admin/today-stats');
        setTodayStats(todayRes.data);

        const topRes = await API.get('/api/admin/top-items');
        setTopItems(topRes.data);

        const weeklyRes = await API.get('/api/admin/weekly-revenue');
        setWeeklyRevenue(weeklyRes.data);
      } catch (err) {
        console.error('Sales fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  if (loading) return <div className="text-center py-40 text-4xl text-gray-600">Loading sales data...</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
        <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-10 rounded-3xl shadow-3xl text-white">
          <h3 className="text-3xl font-semibold mb-6">Today's Revenue</h3>
          <div className="text-6xl font-bold">₹{todayStats.revenue.toLocaleString()}</div>
          <p className="mt-6 text-2xl opacity-90">{todayStats.bills} bills</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-10 rounded-3xl shadow-3xl text-white">
          <h3 className="text-3xl font-semibold mb-6">Average Bill</h3>
          <div className="text-6xl font-bold">₹{todayStats.avgBill.toFixed(0)}</div>
          <p className="mt-6 text-2xl opacity-90">Per customer</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-10 rounded-3xl shadow-3xl text-white">
          <h3 className="text-3xl font-semibold mb-6">Items Served</h3>
          <div className="text-6xl font-bold">{todayStats.orders}</div>
          <p className="mt-6 text-2xl opacity-90">Total today</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-10 rounded-3xl shadow-3xl text-white">
          <h3 className="text-3xl font-semibold mb-6">Peak Day</h3>
          <div className="text-5xl font-bold">Saturday</div>
          <p className="mt-6 text-2xl opacity-90">Highest sales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="bg-white p-12 rounded-3xl shadow-3xl">
          <h3 className="text-4xl font-bold text-gray-800 mb-10 text-center">Weekly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={5} dot={{ fill: '#f59e0b', r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-12 rounded-3xl shadow-3xl">
          <h3 className="text-4xl font-bold text-gray-800 mb-10 text-center">Top Selling Items Today</h3>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={topItems}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#f59e0b" name="Qty Sold" />
              <Bar dataKey="revenue" fill="#dc2626" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default SalesDashboard;