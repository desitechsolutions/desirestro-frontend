// src/components/reports/PaymentMethodChart.js

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

const PaymentMethodChart = ({ paymentReport, showBarChart = false }) => {
  if (!paymentReport?.paymentMethods || paymentReport.paymentMethods.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Payment Methods</h3>
        <p className="text-gray-500 text-center py-8">No payment data available</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const data = paymentReport.paymentMethods.map(pm => ({
    name: pm.method || 'Unknown',
    value: pm.amount || 0,
    count: pm.count || 0,
    percentage: pm.percentage || 0
  }));

  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{data.name}</p>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-semibold text-blue-600">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Transactions: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Share: <span className="font-semibold text-green-600">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Payment Methods</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Avg Transaction</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCount > 0 ? totalAmount / totalCount : 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Payment Methods</p>
          <p className="text-2xl font-bold text-purple-600">{data.length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Top Method</p>
          <p className="text-lg font-bold text-orange-600 truncate">
            {data.length > 0 ? data[0].name : 'N/A'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        {showBarChart ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value} (${entry.payload.count})`}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detailed Breakdown */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-800 mb-3">Detailed Breakdown</h4>
        <div className="space-y-3">
          {data.map((method, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="font-semibold text-gray-800">{method.name}</p>
                  <p className="text-xs text-gray-500">{method.count} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{formatCurrency(method.value)}</p>
                <p className="text-xs text-gray-500">{method.percentage.toFixed(1)}% of total</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {data.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-sm text-blue-800">
            <strong>💡 Insight:</strong> {data[0].name} is your most popular payment method, 
            accounting for {data[0].percentage.toFixed(1)}% of all transactions 
            ({formatCurrency(data[0].value)}).
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodChart;

// Made with Bob
