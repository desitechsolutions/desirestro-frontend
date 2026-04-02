// src/pages/admin/SalesDashboard.js

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getDailySalesReport, getPaymentMethodReport } from '../../services/api';
import PaymentMethodChart from '../../components/reports/PaymentMethodChart';
import ExportButtons from '../../components/reports/ExportButtons';
import API from '../../services/api';

const SalesDashboard = () => {
  const { currentUser } = useAuth();
  const restaurantId = currentUser?.restaurantId;

  const [todayStats, setTodayStats] = useState({ revenue: 0, bills: 0, avgBill: 0, orders: 0 });
  const [topItems, setTopItems] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [rangeRevenue, setRangeRevenue] = useState([]);
  const [paymentReport, setPaymentReport] = useState(null);
  const [dailyReport, setDailyReport] = useState(null);
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
        // Fetch legacy data for backward compatibility
        const [todayRes, topRes, weeklyRes] = await Promise.all([
          API.get('/api/admin/today-stats'),
          API.get('/api/admin/top-items'),
          API.get('/api/admin/weekly-revenue'),
        ]);
        setTodayStats(todayRes.data);
        setTopItems(topRes.data);
        setWeeklyRevenue(weeklyRes.data);

        // Fetch new report data if restaurantId is available
        if (restaurantId) {
          try {
            const [dailyRes, paymentRes] = await Promise.all([
              getDailySalesReport(restaurantId, today),
              getPaymentMethodReport(restaurantId, sevenDaysAgo, today)
            ]);
            setDailyReport(dailyRes.data);
            setPaymentReport(paymentRes.data);
          } catch (err) {
            console.log('New reports not available yet:', err);
          }
        }
      } catch (err) {
        console.error('Sales fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

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
      {/* Summary Cards */}
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

      {/* Charts Row 1 */}
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

      {/* Payment Method Chart - NEW */}
      {paymentReport && (
        <div className="mb-16">
          <PaymentMethodChart paymentReport={paymentReport} showBarChart={false} />
        </div>
      )}

      {/* Additional Insights - NEW */}
      {dailyReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border-2 border-blue-200">
            <h4 className="text-lg font-bold text-blue-800 mb-4">💰 Collection Efficiency</h4>
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {dailyReport.collectionEfficiency?.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-blue-700">
              ₹{dailyReport.totalCollected?.toLocaleString() || 0} collected of ₹{dailyReport.totalRevenue?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border-2 border-green-200">
            <h4 className="text-lg font-bold text-green-800 mb-4">📊 Average Items/Bill</h4>
            <p className="text-4xl font-bold text-green-600 mb-2">
              {dailyReport.averageItemsPerBill?.toFixed(1) || 0}
            </p>
            <p className="text-sm text-green-700">
              {dailyReport.totalItemsSold || 0} items across {dailyReport.totalBills || 0} bills
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border-2 border-purple-200">
            <h4 className="text-lg font-bold text-purple-800 mb-4">🎯 Tax Collected</h4>
            <p className="text-4xl font-bold text-purple-600 mb-2">
              ₹{dailyReport.totalTax?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-purple-700">
              CGST: ₹{dailyReport.totalCGST?.toLocaleString() || 0} | SGST: ₹{dailyReport.totalSGST?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      )}

      {/* Date Range Revenue Report */}
      <div className="bg-white p-12 rounded-3xl shadow-3xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-4xl font-bold text-gray-800">📅 Revenue by Date Range</h3>
          {restaurantId && (
            <ExportButtons
              restaurantId={restaurantId}
              reportType="daily-sales"
              params={{ date: today }}
            />
          )}
        </div>
        
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

      {/* Quick Links to Detailed Reports */}
      <div className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border-2 border-amber-200">
        <h3 className="text-2xl font-bold text-amber-800 mb-6 text-center">📊 Explore Detailed Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/admin/reports/sales"
            className="block text-center p-4 bg-white rounded-lg hover:shadow-lg transition border-2 border-transparent hover:border-blue-400"
          >
            <div className="text-3xl mb-2">📊</div>
            <p className="font-semibold text-gray-800">Sales Reports</p>
          </a>
          <a
            href="/admin/reports/items"
            className="block text-center p-4 bg-white rounded-lg hover:shadow-lg transition border-2 border-transparent hover:border-green-400"
          >
            <div className="text-3xl mb-2">🍽️</div>
            <p className="font-semibold text-gray-800">Item Reports</p>
          </a>
          <a
            href="/admin/reports/gst"
            className="block text-center p-4 bg-white rounded-lg hover:shadow-lg transition border-2 border-transparent hover:border-purple-400"
          >
            <div className="text-3xl mb-2">📋</div>
            <p className="font-semibold text-gray-800">GST Reports</p>
          </a>
          <a
            href="/admin/reports/customers"
            className="block text-center p-4 bg-white rounded-lg hover:shadow-lg transition border-2 border-transparent hover:border-orange-400"
          >
            <div className="text-3xl mb-2">👥</div>
            <p className="font-semibold text-gray-800">Customer Analytics</p>
          </a>
        </div>
      </div>
    </>
  );
};

export default SalesDashboard;

// Made with Bob
