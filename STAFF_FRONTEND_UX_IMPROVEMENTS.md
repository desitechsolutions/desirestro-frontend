# Staff Management Frontend UX Improvements

## Overview
This document provides the complete updated code for `src/pages/admin/StaffManagement.js` with Toast notifications, loading states, confirmation dialogs, and better error handling.

## Complete Updated Code

```javascript
// src/pages/admin/StaffManagement.js

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../../services/api';
import { useConfirm } from '../../hooks/useConfirm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm } = useConfirm();

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
      
      // Handle ApiResponse wrapper
      setStaff(staffRes.data.data || staffRes.data);
      setAttendance(attendanceRes.data.data || attendanceRes.data);
      setLeaves(leaveRes.data.data || leaveRes.data);
      
      toast.success('Staff data loaded successfully');
    } catch (err) {
      console.error('Staff data error:', err);
      const message = err.response?.data?.message || 'Failed to load staff data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async () => {
    if (!newStaff.fullName || !newStaff.username) {
      toast.error('Full Name and Username are required');
      return;
    }
    
    if (newStaff.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/staff', newStaff);
      const createdStaff = res.data.data || res.data;
      
      setStaff(prev => [createdStaff, ...prev]);
      setNewStaff({ fullName: '', username: '', role: 'CAPTAIN', phone: '', email: '' });
      
      toast.success(`Staff member "${createdStaff.fullName}" added successfully!`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add staff — username may already exist';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyLeave = async () => {
    if (!newLeave.staffId || !newLeave.fromDate || !newLeave.toDate) {
      toast.error('Please select staff and dates');
      return;
    }
    
    if (new Date(newLeave.fromDate) > new Date(newLeave.toDate)) {
      toast.error('From date must be before to date');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await API.post('/api/staff/leaves', newLeave);
      toast.success('Leave request submitted successfully!');
      setNewLeave({ staffId: '', fromDate: '', toDate: '', reason: '' });
      fetchStaffData();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit leave request';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveLeave = async (id, staffName) => {
    const confirmed = await confirm({
      title: 'Approve Leave',
      message: `Are you sure you want to approve leave for "${staffName}"?`,
      confirmText: 'Approve',
      confirmColor: 'green'
    });
    
    if (!confirmed) return;
    
    try {
      await API.patch(`/api/staff/leaves/${id}/approve`);
      toast.success(`Leave approved for ${staffName}`);
      fetchStaffData();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to approve leave';
      toast.error(message);
    }
  };

  const rejectLeave = async (id, staffName) => {
    const confirmed = await confirm({
      title: 'Reject Leave',
      message: `Are you sure you want to reject leave for "${staffName}"?`,
      confirmText: 'Reject',
      confirmColor: 'red'
    });
    
    if (!confirmed) return;
    
    try {
      await API.patch(`/api/staff/leaves/${id}/reject`);
      toast.info(`Leave rejected for ${staffName}`);
      fetchStaffData();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reject leave';
      toast.error(message);
    }
  };

  const deleteStaff = async (id, name) => {
    const confirmed = await confirm({
      title: 'Delete Staff Member',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone and will remove all associated attendance and leave records.`,
      confirmText: 'Delete',
      confirmColor: 'red'
    });
    
    if (!confirmed) return;
    
    try {
      await API.delete(`/api/staff/${id}`);
      setStaff(prev => prev.filter(s => s.id !== id));
      toast.success(`Staff member "${name}" deleted successfully`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete staff member';
      toast.error(message);
    }
  };

  const clockInOut = async (staffId, action, staffName) => {
    try {
      await API.post(`/api/staff/${staffId}/${action}`);
      const actionText = action === 'clock-in' ? 'clocked in' : 'clocked out';
      toast.success(`${staffName} ${actionText} successfully`);
      fetchStaffData();
    } catch (err) {
      const message = err.response?.data?.message || `Failed to ${action}`;
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <LoadingSpinner size="large" />
      </div>
    );
  }

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
            placeholder="Full Name *"
            value={newStaff.fullName}
            onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
            disabled={isSubmitting}
          />
          <input
            type="text"
            placeholder="Username (login) *"
            value={newStaff.username}
            onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
            disabled={isSubmitting}
          />
          <select
            value={newStaff.role}
            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={newStaff.email}
            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
            disabled={isSubmitting}
          />
        </div>
        <button
          onClick={createStaff}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-8 rounded-2xl text-4xl font-bold shadow-2xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'ADDING...' : '+ ADD STAFF MEMBER'}
        </button>
      </div>

      {/* Current Staff & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
        {/* Staff List */}
        <div className="bg-white p-12 rounded-3xl shadow-3xl">
          <h3 className="text-4xl font-bold text-gray-800 mb-10">Current Staff ({staff.length})</h3>
          {staff.length === 0 ? (
            <p className="text-center text-2xl text-gray-600 py-20">No staff members yet</p>
          ) : (
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
                        onClick={() => clockInOut(s.id, 'clock-in', s.fullName)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg font-bold transition"
                        title="Clock In"
                      >
                        Clock In
                      </button>
                      <button
                        onClick={() => clockInOut(s.id, 'clock-out', s.fullName)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-lg font-bold transition"
                        title="Clock Out"
                      >
                        Clock Out
                      </button>
                      <button
                        onClick={() => deleteStaff(s.id, s.fullName)}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-lg font-bold transition"
                        title="Delete staff member"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    {a.clockOut ? `${a.hoursWorked.toFixed(2)}h` : '🟢 Active'}
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
            disabled={isSubmitting}
          >
            <option value="">Select Staff *</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
          <input
            type="date"
            value={newLeave.fromDate}
            onChange={(e) => setNewLeave({ ...newLeave, fromDate: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
            disabled={isSubmitting}
            min={new Date().toISOString().split('T')[0]}
          />
          <input
            type="date"
            value={newLeave.toDate}
            onChange={(e) => setNewLeave({ ...newLeave, toDate: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
            disabled={isSubmitting}
            min={newLeave.fromDate || new Date().toISOString().split('T')[0]}
          />
          <input
            type="text"
            placeholder="Reason"
            value={newLeave.reason}
            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
            className="px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
            disabled={isSubmitting}
          />
        </div>
        <button
          onClick={applyLeave}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 rounded-2xl text-4xl font-bold shadow-2xl mb-16 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT LEAVE REQUEST'}
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
                    <div className="text-lg italic text-gray-600 mt-4">{l.reason || 'No reason provided'}</div>
                  </div>
                  <div className="flex gap-6">
                    <button
                      onClick={() => approveLeave(l.id, l.staffName)}
                      className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-xl text-2xl font-bold transition"
                    >
                      ✓ APPROVE
                    </button>
                    <button
                      onClick={() => rejectLeave(l.id, l.staffName)}
                      className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-xl text-2xl font-bold transition"
                    >
                      ✗ REJECT
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
```

## Key Improvements

### 1. Toast Notifications
- ✅ Replaced all `alert()` calls with `toast.success()`, `toast.error()`, `toast.info()`
- ✅ Better user feedback with colored notifications
- ✅ Auto-dismiss after 3 seconds

### 2. Loading States
- ✅ Added `isSubmitting` state for form submissions
- ✅ Disabled buttons during submission
- ✅ Visual feedback ("ADDING...", "SUBMITTING...")
- ✅ Full-page loading spinner on initial load

### 3. Confirmation Dialogs
- ✅ Used `useConfirm` hook for delete, approve, reject actions
- ✅ Clear confirmation messages
- ✅ Color-coded buttons (green for approve, red for delete/reject)

### 4. Error Handling
- ✅ Extract error messages from API response
- ✅ Fallback to generic messages
- ✅ Display user-friendly error messages

### 5. ApiResponse Wrapper Handling
- ✅ Handle both `res.data.data` and `res.data` formats
- ✅ Compatible with new backend ApiResponse wrapper

### 6. Form Validation
- ✅ Client-side validation before API calls
- ✅ Username length validation
- ✅ Date range validation
- ✅ Required field validation

### 7. UX Enhancements
- ✅ Disabled state for buttons during submission
- ✅ Min date validation for leave dates
- ✅ Empty state messages
- ✅ Active status indicator (🟢)
- ✅ Better button labels with icons
- ✅ Transition effects on hover

## Installation

No additional dependencies needed! The code uses:
- `react-toastify` (already installed)
- `useConfirm` hook (already created)
- `LoadingSpinner` component (already created)

## Usage

Simply replace the content of `src/pages/admin/StaffManagement.js` with the code above.

## Testing Checklist

- [ ] Test staff creation with valid data
- [ ] Test staff creation with invalid data (empty fields, short username)
- [ ] Test staff deletion with confirmation
- [ ] Test clock-in/clock-out
- [ ] Test leave application
- [ ] Test leave approval/rejection
- [ ] Test loading states
- [ ] Test error messages
- [ ] Test Toast notifications
- [ ] Test confirmation dialogs

## Notes

- All Toast notifications are color-coded (green for success, red for error, blue for info)
- Confirmation dialogs prevent accidental deletions
- Loading states prevent double submissions
- Error messages are extracted from API responses for better debugging