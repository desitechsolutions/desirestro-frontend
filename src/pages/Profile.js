import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authChangePassword, getRestaurantProfile, updateRestaurantProfile } from '../services/api';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isOwnerOrAdmin = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';

  // ── Change Password ───────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // ── Restaurant Profile ────────────────────────────────────────────────────
  const [restaurant, setRestaurant] = useState(null);
  const [restForm, setRestForm] = useState({
    name: '', address: '', phone: '', email: '', state: '', gstin: '', gstRate: '',
  });
  const [restLoading, setRestLoading] = useState(false);
  const [restSaving, setRestSaving] = useState(false);
  const [restError, setRestError] = useState('');
  const [restSuccess, setRestSuccess] = useState('');

  useEffect(() => {
    if (!isOwnerOrAdmin) return;
    setRestLoading(true);
    getRestaurantProfile()
      .then((res) => {
        const data = res.data?.data || res.data;
        setRestaurant(data);
        setRestForm({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          state: data.state || '',
          gstin: data.gstin || '',
          gstRate: data.gstRate ?? '',
        });
      })
      .catch(() => setRestError('Failed to load restaurant profile.'))
      .finally(() => setRestLoading(false));
  }, [isOwnerOrAdmin]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }

    setPwLoading(true);
    try {
      await authChangePassword({ currentPassword, newPassword });
      setPwSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Failed to change password. Please check your current password.';
      setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  };

  const handleRestUpdate = async (e) => {
    e.preventDefault();
    setRestError('');
    setRestSuccess('');
    setRestSaving(true);
    try {
      const payload = {
        name: restForm.name || undefined,
        address: restForm.address || undefined,
        phone: restForm.phone || undefined,
        email: restForm.email || undefined,
        state: restForm.state || undefined,
        gstin: restForm.gstin || undefined,
        gstRate: restForm.gstRate !== '' ? parseFloat(restForm.gstRate) : undefined,
      };
      const res = await updateRestaurantProfile(payload);
      const updated = res.data?.data || res.data;
      setRestaurant(updated);
      setRestSuccess('Restaurant profile updated successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Failed to update restaurant profile.';
      setRestError(msg);
    } finally {
      setRestSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* ── User Info Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center text-2xl font-bold text-white">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{currentUser?.fullName}</h2>
              <p className="text-sm text-gray-500">@{currentUser?.username}</p>
              <span className="inline-block mt-1 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-0.5 rounded-full">
                {currentUser?.role}
              </span>
            </div>
          </div>
          {currentUser?.restaurantName && (
            <div className="mt-4 pt-4 border-t text-sm text-gray-600">
              🍛 <span className="font-medium">{currentUser.restaurantName}</span>
            </div>
          )}
        </div>

        {/* ── Restaurant Profile (OWNER / ADMIN only) ────────────────────── */}
        {isOwnerOrAdmin && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5">🏪 Restaurant Profile</h3>

            {restLoading && (
              <p className="text-sm text-gray-500">Loading…</p>
            )}

            {!restLoading && restaurant && (
              <>
                {/* Read-only meta */}
                <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">Restaurant Code</p>
                    <p className="font-semibold text-gray-700">{restaurant.code || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">Status</p>
                    <p className={`font-semibold ${restaurant.active ? 'text-green-600' : 'text-red-500'}`}>
                      {restaurant.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {restError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {restError}
                  </div>
                )}
                {restSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                    {restSuccess}
                  </div>
                )}

                <form onSubmit={handleRestUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={restForm.name}
                        onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={restForm.phone}
                        onChange={(e) => setRestForm({ ...restForm, phone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={restForm.address}
                        onChange={(e) => setRestForm({ ...restForm, address: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={restForm.email}
                        onChange={(e) => setRestForm({ ...restForm, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={restForm.state}
                        onChange={(e) => setRestForm({ ...restForm, state: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                      <input
                        type="text"
                        value={restForm.gstin}
                        onChange={(e) => setRestForm({ ...restForm, gstin: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={restForm.gstRate}
                        onChange={(e) => setRestForm({ ...restForm, gstRate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={restSaving}
                      className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold py-3 rounded-xl transition"
                    >
                      {restSaving ? 'Saving…' : 'Update Restaurant Profile'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {/* ── Change Password Card ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-5">🔒 Change Password</h3>

          {pwError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
              {pwSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={pwLoading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold py-3 rounded-xl transition"
              >
                {pwLoading ? 'Saving…' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl transition"
              >
                Back
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
