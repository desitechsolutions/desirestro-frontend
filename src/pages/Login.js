import React, { useEffect, useState } from 'react';
import api, { authLogin, authRegister } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ROLE_ROUTES = {
  ADMIN: '/admin',
  OWNER: '/admin',
  CAPTAIN: '/tables',
  KITCHEN: '/kot',
  CASHIER: '/billing',
};

// ── Small helper icons (inline SVG so no icon library needed) ────────────────
const SpoonForkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

// ── Input component ───────────────────────────────────────────────────────────
const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  required,
  autoComplete,
  ...rest
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPassword && showPwd ? 'text' : type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-gray-800 placeholder-gray-400 bg-white"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition"
            tabIndex={-1}
          >
            <EyeIcon open={showPwd} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Forgot Password field
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset Password fields
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Register fields
  const [reg, setReg] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    restaurantEmail: '',
    restaurantState: '',
    gstin: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Check for reset token in URL on mount
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setTab('reset');
      setError('');
      setSuccess('');
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authLogin({ username, password });
      // Backend wraps response in ApiResponse<AuthResponse>
      const data = res.data?.data ?? res.data;
      login(
        data.token,
        data.role,
        data.fullName,
        data.restaurantId,
        data.restaurantName
      );
      navigate(ROLE_ROUTES[data.role] || '/login', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Invalid username or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (reg.password !== reg.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!reg.restaurantName.trim()) {
      setError('Restaurant name is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: reg.fullName,
        username: reg.username,
        password: reg.password,
        restaurantName: reg.restaurantName,
        restaurantAddress: reg.restaurantAddress || undefined,
        restaurantPhone: reg.restaurantPhone || undefined,
        restaurantEmail: reg.restaurantEmail || undefined,
        restaurantState: reg.restaurantState || undefined,
        gstin: reg.gstin || undefined,
      };

      const res = await authRegister(payload);
      const data = res.data?.data ?? res.data;

      login(
        data.token,
        data.role,
        data.fullName,
        data.restaurantId,
        data.restaurantName
      );

      setSuccess(
        `Welcome, ${data.fullName}! Your restaurant "${data.restaurantName}" is ready.`
      );
      setTimeout(
        () => navigate(ROLE_ROUTES[data.role] || '/admin', { replace: true }),
        1200
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Use the default axios client exported from ../services/api
      await api.post('/api/auth/forgot-password', {
        email: forgotEmail,
        username: forgotEmail,
      });

      setSuccess(
        'If an account exists, a reset link has been sent to your email.'
      );
      setForgotEmail('');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Failed to process request.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetToken) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        token: resetToken,
        newPassword,
      });

      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        setTab('login');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Reset failed. Token may be expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const setRegField = (key) => (e) =>
    setReg((r) => ({ ...r, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

        {/* Brand */}
        <div className="relative z-10 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-white/20 p-4 rounded-2xl">
              <SpoonForkIcon />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-3 tracking-tight">
            DesiRestro
          </h1>
          <p className="text-xl text-amber-100 font-medium mb-2">
            Point of Sale System
          </p>
          <p className="text-amber-200 text-sm mb-12">
            Multi-tenant restaurant management, reimagined.
          </p>

          {/* Feature bullets */}
          <div className="space-y-4 text-left max-w-xs mx-auto">
            {[
              ['🍽️', 'Smart menu & category management'],
              ['🪑', 'Real-time table & party tracking'],
              ['🧾', 'Instant KOT for kitchen staff'],
              ['💳', 'One-click billing & settlement'],
              ['📊', 'Live sales dashboards & reports'],
              ['🏪', 'Full multi-tenant isolation'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-amber-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16">
        {/* Mobile brand header */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-2xl mb-3">
            <SpoonForkIcon />
            <span className="font-extrabold text-xl">DesiRestro</span>
          </div>
          <p className="text-gray-500 text-sm">
            Restaurant POS &amp; Management
          </p>
        </div>

        <div className="w-full max-w-md">
          {/* Tabs */}
          {(tab === 'login' || tab === 'register') && (
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
              {['login', 'register'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setError('');
                    setSuccess('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    tab === t
                      ? 'bg-white text-amber-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'login' ? '🔑 Sign In' : '🏪 Register Restaurant'}
                </button>
              ))}
            </div>
          )}

          {/* Alert messages */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome back
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sign in to your restaurant account
                </p>
              </div>

              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="e.g. admin or captain1"
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs text-amber-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                New restaurant?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-amber-600 font-semibold hover:underline"
                >
                  Register here
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Forgot Password
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your email/username to receive a reset link
                </p>
              </div>

              <Input
                label="Email or Username"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                placeholder="Enter registered email/username"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-sm text-gray-500 hover:text-amber-600 font-medium"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* ── RESET PASSWORD FORM ── */}
          {tab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Set New Password
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Please choose a strong new password
                </p>
              </div>

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                placeholder="Repeat new password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Updating…
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-sm text-gray-500 hover:text-amber-600 font-medium"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Register your restaurant
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Create a new tenant account for your restaurant
                </p>
              </div>

              {/* Personal */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Account Details
                </p>
                <Input
                  label="Full Name"
                  value={reg.fullName}
                  onChange={setRegField('fullName')}
                  required
                  placeholder="Your full name"
                />
                <Input
                  label="Username"
                  value={reg.username}
                  onChange={setRegField('username')}
                  required
                  autoComplete="username"
                  placeholder="Choose a username"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Password"
                    type="password"
                    value={reg.password}
                    onChange={setRegField('password')}
                    required
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={reg.confirmPassword}
                    onChange={setRegField('confirmPassword')}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              {/* Restaurant details */}
              <div className="space-y-4 pt-2">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Restaurant Details
                </p>
                <Input
                  label="Restaurant Name"
                  value={reg.restaurantName}
                  onChange={setRegField('restaurantName')}
                  required
                  placeholder="e.g. Spice Garden"
                />
                <Input
                  label="Address"
                  value={reg.restaurantAddress}
                  onChange={setRegField('restaurantAddress')}
                  placeholder="Full address (optional)"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Phone"
                    value={reg.restaurantPhone}
                    onChange={setRegField('restaurantPhone')}
                    placeholder="+91 9999999999"
                  />
                  <Input
                    label="State"
                    value={reg.restaurantState}
                    onChange={setRegField('restaurantState')}
                    placeholder="e.g. Gujarat"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Email"
                    type="email"
                    value={reg.restaurantEmail}
                    onChange={setRegField('restaurantEmail')}
                    placeholder="restaurant@email.com"
                  />
                  <Input
                    label="GSTIN"
                    value={reg.gstin}
                    onChange={setRegField('gstin')}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  '🍽️ Create Restaurant Account'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-amber-600 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;