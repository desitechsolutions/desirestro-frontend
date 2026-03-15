// src/pages/admin/SalesDashboard.js

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../services/api';

const SalesDashboard = () => {
  const [todayStats, setTodayStats] = useState({ revenue: 0, bills: 0, avgBill: 0, orders: 0 });
  const [topItems, setTopItems] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [rangeRevenue, setRangeRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeLoading, setRangeLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const sevenDaysAgo = new Date(Date.now() - 6 * MS_PER_DAY).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(sevenDaysAgo);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const [todayRes, topRes, weeklyRes] = await Promise.all([
          API.get('/api/admin/today-stats'),
          API.get('/api/admin/top-items'),
          API.get('/api/admin/weekly-revenue'),
        ]);
        setTodayStats(todayRes.data);
        setTopItems(topRes.data);
        setWeeklyRevenue(weeklyRes.data);
      } catch (err) {
        console.error('Sales fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  const fetchRangeRevenue = async () => {
    if (!fromDate || !toDate) return;
    setRangeLoading(true);
    try {
      const res = await API.get(`/api/admin/revenue?from=${fromDate}&to=${toDate}`);
      setRangeRevenue(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Range revenue error:', err);
    } finally {
      setRangeLoading(false);
    }
  };

  if (loading) return <div className="text-center py-40 text-4xl text-gray-600">Loading sales data...</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
        <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-10 rounded-3xl shadow-3xl text-white">
          <h3 className="text-3xl font-semibold mb-6">Today's Revenue</h3>
          <div className="text-6xl font-bold">₹{todayStats.revenue?.toLocaleString() || 0}</div>
          <p className="mt-6 text-2xl opacity-90">{todayStats.bills} bills</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-10 rounded-3xl shadow-3xl text-white">
          <h3 className="text-3xl font-semibold mb-6">Average Bill</h3>
          <div className="text-6xl font-bold">₹{Number(todayStats.avgBill || 0).toFixed(0)}</div>
          <p className="mt-6 text-2xl opacity-90">Per customer</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-10 rounded-3xl shadow-3xl text-white">
          <h3 className="text-3xl font-semibold mb-6">Items Served</h3>
          <div className="text-6xl font-bold">{todayStats.orders || 0}</div>
          <p className="mt-6 text-2xl opacity-90">Total today</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-10 rounded-3xl shadow-3xl text-white">
          <h3 className="text-3xl font-semibold mb-6">Tables Served</h3>
          <div className="text-6xl font-bold">{todayStats.bills || 0}</div>
          <p className="mt-6 text-2xl opacity-90">Parties billed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
        <div className="bg-white p-12 rounded-3xl shadow-3xl">
          <h3 className="text-4xl font-bold text-gray-800 mb-10 text-center">Weekly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
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

      {/* Date Range Revenue Report */}
      <div className="bg-white p-12 rounded-3xl shadow-3xl">
        <h3 className="text-4xl font-bold text-gray-800 mb-8 text-center">📅 Revenue by Date Range</h3>
        <div className="flex flex-wrap gap-6 items-end justify-center mb-10">
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold text-gray-700">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="px-6 py-4 text-xl border-4 border-amber-400 rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold text-gray-700">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="px-6 py-4 text-xl border-4 border-amber-400 rounded-2xl"
            />
          </div>
          <button
            onClick={fetchRangeRevenue}
            disabled={rangeLoading}
            className="px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-2xl font-bold rounded-2xl shadow-xl transition disabled:opacity-60"
          >
            {rangeLoading ? 'Loading...' : '🔍 Generate Report'}
          </button>
        </div>

        {rangeRevenue.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={rangeRevenue}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#f59e0b" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-8 text-center text-3xl font-bold text-amber-800">
              Total: ₹{rangeRevenue.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="text-center text-2xl text-gray-500 py-12">
            Select a date range and click Generate Report
          </div>
        )}
      </div>
    </>
  );
};

export default SalesDashboard;