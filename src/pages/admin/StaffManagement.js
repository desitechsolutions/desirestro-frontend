// src/pages/admin/StaffManagement.js

import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    username: '',
    role: 'CAPTAIN',
    phone: '',
    email: ''
  });
  const [newLeave, setNewLeave] = useState({
    staffId: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [staffRes, attendanceRes, leaveRes] = await Promise.all([
        API.get('/api/staff'),
        API.get('/api/staff/attendance/today'),
        API.get('/api/staff/leaves/pending')
      ]);
      setStaff(staffRes.data);
      setAttendance(attendanceRes.data);
      setLeaves(leaveRes.data);
    } catch (err) {
      console.error('Staff data error:', err);
      alert('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async () => {
    if (!newStaff.fullName || !newStaff.username) {
      alert('Full Name and Username are required');
      return;
    }
    try {
      const res = await API.post('/api/staff', newStaff);
      setStaff(prev => [...prev, res.data]);
      setNewStaff({ fullName: '', username: '', role: 'CAPTAIN', phone: '', email: '' });
      alert('Staff member added successfully!');
    } catch (err) {
      alert('Failed to add staff — username may already exist');
    }
  };

  const applyLeave = async () => {
    if (!newLeave.staffId || !newLeave.fromDate || !newLeave.toDate) {
      alert('Please select staff and dates');
      return;
    }
    try {
      await API.post('/api/staff/leaves', newLeave);
      alert('Leave request submitted!');
      setNewLeave({ staffId: '', fromDate: '', toDate: '', reason: '' });
      fetchStaffData();
    } catch (err) {
      alert('Failed to submit leave request');
    }
  };

  const approveLeave = async (id) => {
    try {
      await API.patch(`/api/staff/leaves/${id}/approve`);
      fetchStaffData();
      alert('Leave approved');
    } catch (err) {
      alert('Failed to approve leave');
    }
  };

  const rejectLeave = async (id) => {
    try {
      await API.patch(`/api/staff/leaves/${id}/reject`);
      fetchStaffData();
      alert('Leave rejected');
    } catch (err) {
      alert('Failed to reject leave');
    }
  };

  const deleteStaff = async (id, name) => {
    if (!window.confirm(`Delete staff member "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/api/staff/${id}`);
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete staff member');
    }
  };

  const clockInOut = async (staffId, action) => {
    try {
      await API.post(`/api/staff/${staffId}/${action}`);
      fetchStaffData();
    } catch (err) {
      alert(`Failed to ${action}`);
    }
  };

  if (loading) return <div className="text-center py-40 text-4xl text-gray-600">Loading staff data...</div>;

  return (
    <>
      <h2 className="text-5xl font-bold text-center text-amber-800 mb-16">
        Staff Management
      </h2>

      {/* Add New Staff Member */}
      <div className="bg-white p-12 rounded-3xl shadow-3xl mb-20">
        <h3 className="text-4xl font-bold text-gray-800 mb-12 text-center">
          Add New Staff Member
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <input
            type="text"
            placeholder="Full Name"
            value={newStaff.fullName}
            onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          />
          <input
            type="text"
            placeholder="Username (login)"
            value={newStaff.username}
            onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          />
          {/*
            <input
            type="password"
            placeholder="Password"
            value={newStaff.password}
            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          />
          */}
          <select
            value={newStaff.role}
            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          >
            <option value="CAPTAIN">Captain</option>
            <option value="KITCHEN">Kitchen</option>
            <option value="CASHIER">Cashier</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
          </select>
          <input
            type="text"
            placeholder="Phone"
            value={newStaff.phone}
            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={newStaff.email}
            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          />
        </div>
        <button
          onClick={createStaff}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-8 rounded-2xl text-4xl font-bold shadow-2xl transition transform hover:scale-105"
        >
          + ADD STAFF MEMBER
        </button>
      </div>

      {/* Current Staff & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
        {/* Staff List */}
        <div className="bg-white p-12 rounded-3xl shadow-3xl">
          <h3 className="text-4xl font-bold text-gray-800 mb-10">Current Staff ({staff.length})</h3>
          <div className="space-y-8">
            {staff.map(s => (
              <div key={s.id} className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border-4 border-amber-300">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-amber-800">{s.fullName}</div>
                    <div className="text-xl text-gray-700 mt-2">@{s.username} • {s.role}</div>
                    <div className="text-lg text-gray-600 mt-2">{s.phone} {s.email && `• ${s.email}`}</div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => clockInOut(s.id, 'clock-in')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg font-bold"
                    >
                      Clock In
                    </button>
                    <button
                      onClick={() => clockInOut(s.id, 'clock-out')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-lg font-bold"
                    >
                      Clock Out
                    </button>
                    <button
                      onClick={() => deleteStaff(s.id, s.fullName)}
                      className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-lg font-bold"
                      aria-label="Delete staff member"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white p-12 rounded-3xl shadow-3xl">
          <h3 className="text-4xl font-bold text-gray-800 mb-10">Today's Attendance</h3>
          <div className="space-y-6">
            {attendance.length === 0 ? (
              <p className="text-center text-2xl text-gray-600 py-20">No attendance recorded yet</p>
            ) : (
              attendance.map(a => (
                <div key={a.id} className="flex justify-between items-center py-6 border-b-2 border-amber-200">
                  <div>
                    <div className="text-3xl font-bold">{a.staffName}</div>
                    <div className="text-xl text-gray-600">
                        In: {a.clockIn ? new Date(a.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} 
                        • Out: {a.clockOut ? new Date(a.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-amber-700">
                    {a.clockOut ? `${a.hoursWorked.toFixed(2)}h` : 'Active'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leave Management */}
      <div className="bg-white p-12 rounded-3xl shadow-3xl">
        <h3 className="text-4xl font-bold text-gray-800 mb-10">Leave Management</h3>

        {/* Apply Leave Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <select
            value={newLeave.staffId}
            onChange={(e) => setNewLeave({ ...newLeave, staffId: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
          >
            <option value="">Select Staff</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
          <input
            type="date"
            value={newLeave.fromDate}
            onChange={(e) => setNewLeave({ ...newLeave, fromDate: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
          />
          <input
            type="date"
            value={newLeave.toDate}
            onChange={(e) => setNewLeave({ ...newLeave, toDate: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
          />
          <input
            type="text"
            placeholder="Reason"
            value={newLeave.reason}
            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
          />
        </div>
        <button
          onClick={applyLeave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 rounded-2xl text-4xl font-bold shadow-2xl mb-16"
        >
          SUBMIT LEAVE REQUEST
        </button>

        {/* Pending Leaves */}
        <h4 className="text-3xl font-bold text-gray-800 mb-8">Pending Leave Requests</h4>
        {leaves.length === 0 ? (
          <p className="text-center text-2xl text-gray-600 py-12">No pending leave requests</p>
        ) : (
          <div className="space-y-8">
            {leaves.map(l => (
              <div key={l.id} className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border-4 border-amber-400">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-amber-800">{l.staffName}</div>
                    <div className="text-xl text-gray-700 mt-2">
                      {l.fromDate} → {l.toDate}
                    </div>
                    <div className="text-lg italic text-gray-600 mt-4">{l.reason}</div>
                  </div>
                  <div className="flex gap-6">
                    <button
                      onClick={() => approveLeave(l.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-xl text-2xl font-bold"
                    >
                      APPROVE
                    </button>
                    <button
                      onClick={() => rejectLeave(l.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-xl text-2xl font-bold"
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StaffManagement;