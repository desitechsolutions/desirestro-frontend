import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatNumber, formatCurrency } from '../utils/helpers';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/superadmin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/superadmin/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500">System-wide management and monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => fetchDashboardData()}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Restaurants"
            value={formatNumber(stats?.totalRestaurants || 0)}
            subtitle={`${stats?.activeRestaurants || 0} active`}
            icon="🏪"
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="Active Users"
            value={formatNumber(stats?.totalUsers || 0)}
            subtitle={`${stats?.activeUsers || 0} online`}
            icon="👥"
            color="green"
            trend="+8%"
          />
          <StatCard
            title="Open Tickets"
            value={formatNumber(stats?.openTickets || 0)}
            subtitle={`${stats?.inProgressTickets || 0} in progress`}
            icon="🎫"
            color="yellow"
            trend="-5%"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            subtitle="All time"
            icon="💰"
            color="purple"
            trend="+15%"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'restaurants', 'tickets', 'audit'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab stats={stats} />}
            {activeTab === 'restaurants' && <RestaurantsTab />}
            {activeTab === 'tickets' && <TicketsTab />}
            {activeTab === 'audit' && <AuditTab />}
          </div>
        </div>
      </main>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ stats }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Recent Activity
        </h4>
        <div className="space-y-2">
          <ActivityItem text="New restaurant registered" time="2 hours ago" type="success" />
          <ActivityItem text="Support ticket resolved" time="4 hours ago" type="info" />
          <ActivityItem text="User account activated" time="6 hours ago" type="success" />
          <ActivityItem text="System backup completed" time="8 hours ago" type="info" />
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h4>
        <div className="space-y-2">
          <QuickActionButton 
            to="/superadmin/restaurants" 
            icon="🏪" 
            text="Manage Restaurants" 
          />
          <QuickActionButton 
            to="/superadmin/tickets" 
            icon="🎫" 
            text="View Support Tickets" 
          />
          <QuickActionButton 
            to="/superadmin/users" 
            icon="👥" 
            text="Manage Users" 
          />
          <QuickActionButton 
            to="/superadmin/settings" 
            icon="⚙️" 
            text="System Settings" 
          />
        </div>
      </div>
    </div>

    {/* System Health */}
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-700 mb-3">System Health</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthMetric label="API Response Time" value="45ms" status="good" />
        <HealthMetric label="Database Status" value="Healthy" status="good" />
        <HealthMetric label="Server Load" value="32%" status="good" />
      </div>
    </div>
  </div>
);

const ActivityItem = ({ text, time, type }) => {
  const typeColors = {
    success: 'text-green-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center">
        <span className={`w-2 h-2 rounded-full ${typeColors[type]} mr-3`}></span>
        <span className="text-sm text-gray-600">{text}</span>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
};

const QuickActionButton = ({ to, icon, text }) => (
  <Link 
    to={to} 
    className="flex items-center px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition"
  >
    <span className="text-xl mr-3">{icon}</span>
    <span className="text-sm text-gray-700">{text}</span>
  </Link>
);

const HealthMetric = ({ label, value, status }) => {
  const statusColors = {
    good: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    error: 'text-red-600 bg-red-50',
  };

  return (
    <div className="text-center p-3 bg-gray-50 rounded">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${statusColors[status]} px-2 py-1 rounded inline-block`}>
        {value}
      </p>
    </div>
  );
};

// Placeholder tabs (to be implemented)
const RestaurantsTab = () => (
  <div className="text-center py-12">
    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Restaurant Management</h3>
    <p className="text-gray-500 mb-4">View and manage all restaurants on the platform</p>
    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
      Coming Soon
    </button>
  </div>
);

const TicketsTab = () => (
  <div className="text-center py-12">
    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Support Tickets</h3>
    <p className="text-gray-500 mb-4">Manage support tickets from all restaurants</p>
    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
      Coming Soon
    </button>
  </div>
);

const AuditTab = () => (
  <div className="text-center py-12">
    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Logs</h3>
    <p className="text-gray-500 mb-4">View system-wide audit logs and activity</p>
    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
      Coming Soon
    </button>
  </div>
);

export default SuperAdminDashboard;

// Made with Bob
