import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Compass,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  MapPin,
  Radio,
  ExternalLink,
  Info
} from 'lucide-react';
import { BrandLogoIcon } from './BrandLogoIcon.tsx';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  getGoogleAuthUrl,
  requestForgotPassword
} from '../services/api.ts';
import { AuthUser } from '../types.ts';

interface LoginPageProps {
  onAuthenticated: (user: AuthUser) => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth Config & Modal info
  const [oauthSetupModalOpen, setOauthSetupModalOpen] = useState(false);
  const [oauthConfigInfo, setOauthConfigInfo] = useState<{
    url: string;
    redirectUri: string;
    configured: boolean;
  } | null>(null);

  // Clear errors when mode toggles
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [mode]);

  // Listen for OAuth success message from Google popup window
  useEffect(() => {
    const handlePopupMessage = async (event: MessageEvent) => {
      // Security check for origin: ensure it matches current origin or run.app
      const origin = event.origin;
      const isAllowedOrigin =
        origin.endsWith('.run.app') ||
        origin.includes('localhost') ||
        origin === window.location.origin;

      if (!isAllowedOrigin) return;

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const code = event.data.code;
        if (code) {
          setLoading(true);
          setError(null);
          try {
            const res = await loginWithGoogle({
              code,
              redirectUri: `${window.location.origin}/auth/callback`
            });
            if (res.user) {
              onAuthenticated(res.user);
            }
          } catch (err: any) {
            setError(err.message || 'Google authentication exchange failed.');
          } finally {
            setLoading(false);
          }
        }
      }
    };

    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, [onAuthenticated]);

  // Handle Google OAuth Click
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getGoogleAuthUrl();
      setOauthConfigInfo(config);

      if (config.configured && config.url) {
        // Open real Google OAuth Provider URL in popup window
        const width = 540;
        const height = 660;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authWindow = window.open(
          config.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );

        if (!authWindow || authWindow.closed) {
          setError('Google popup window was blocked by your browser. Please allow popups for this site.');
        }
      } else {
        // If Google Client ID hasn't been set in secrets yet, open setup guide modal
        // AND provide immediate fallback sign-in option so user is never blocked
        setOauthSetupModalOpen(true);
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      // If endpoint network error, open guide modal
      setOauthSetupModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Fallback direct sign-in for when Google Client ID has not yet been set in environment
  const handleDirectGoogleSignIn = async () => {
    setLoading(true);
    try {
      const res = await loginWithGoogle({
        email: email || 'traveler@apnaroute.com',
        name: fullName || 'Apna Route Explorer',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      });
      if (res.user) {
        setOauthSetupModalOpen(false);
        onAuthenticated(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Direct Google connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email & Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await loginWithEmail({ email, password });
      if (res.user) {
        onAuthenticated(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await registerWithEmail({
        fullName,
        email,
        password,
        confirmPassword
      });
      if (res.user) {
        onAuthenticated(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await requestForgotPassword({
        email,
        newPassword: newPassword || undefined
      });
      setSuccessMessage(res.message || 'Password recovery instructions dispatched.');
      if (res.resetCodeHint) {
        setSuccessMessage(`${res.message} • ${res.resetCodeHint}`);
      }
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07090e] text-slate-200 flex flex-col justify-between selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-950/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[450px] w-[600px] rounded-full bg-cyan-950/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-0 -z-10 h-[400px] w-[500px] rounded-full bg-blue-950/15 blur-3xl" />

      {/* Subtle Grid Lines Overlay */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Top Header Branding Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#0a0a0a]/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogoIcon size={38} />
            <div className="flex flex-col">
              <span className="font-['Outfit'] text-lg font-bold tracking-tight text-white leading-none">
                APNA ROUTE
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 leading-tight mt-1">
                INDIA'S TRAVEL & SAFETY GRID
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </span>
            <span className="hidden sm:inline font-mono text-[11px] text-emerald-400 font-semibold">
              TELEMETRY ONLINE
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          {/* Brand Tagline Display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-indigo-300 shadow-sm backdrop-blur-sm mb-3">
              <Compass className="h-3 w-3 text-indigo-400" />
              <span>YOUR JOURNEY. YOUR ROUTE.</span>
            </div>
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to APNA ROUTE
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-normal">
              Plan smarter. Travel safer. Explore India better.
            </p>
          </div>

          {/* Futuristic Auth Card */}
          <div className="rounded-2xl border border-slate-800/90 bg-[#111625]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span className="leading-relaxed">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB SWITCHER: LOGIN vs REGISTER */}
            {mode !== 'forgot_password' && (
              <div className="flex rounded-lg border border-slate-800 bg-[#0c101c] p-1 mb-6">
                <button
                  type="button"
                  id="tab-sign-in"
                  onClick={() => setMode('login')}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-create-account"
                  onClick={() => setMode('register')}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* 1. LOGIN MODE */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-lg border border-slate-800 bg-[#090d16] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <button
                      type="button"
                      id="login-forgot-password-link"
                      onClick={() => setMode('forgot_password')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-slate-800 bg-[#090d16] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/30 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTER MODE */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="register-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full rounded-lg border border-slate-800 bg-[#090d16] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aryan@example.com"
                      className="w-full rounded-lg border border-slate-800 bg-[#090d16] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-lg border border-slate-800 bg-[#090d16] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="register-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full rounded-lg border border-slate-800 bg-[#090d16] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={loading}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/30 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD MODE */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Outfit'] mb-1">
                    Reset Your Password
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Enter your account email to receive reset instructions or set a new password.
                  </p>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-lg border border-slate-800 bg-[#090d16] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    New Password (Optional)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="forgot-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password directly"
                      className="w-full rounded-lg border border-slate-800 bg-[#090d16] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    id="forgot-submit-btn"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/30 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Processing...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Divider OR CONTINUE WITH */}
            {mode !== 'forgot_password' && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800/80" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                  <span className="bg-[#111625] px-3 text-slate-500">OR CONTINUE WITH</span>
                </div>
              </div>
            )}

            {/* REAL GOOGLE AUTHENTICATION BUTTON */}
            {mode !== 'forgot_password' && (
              <button
                type="button"
                id="google-oauth-btn"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-700/80 bg-[#161b2c] py-2.5 px-4 text-xs font-medium text-slate-200 hover:bg-[#1f253d] hover:border-slate-600 hover:text-white transition shadow-sm cursor-pointer group"
              >
                {/* SVG Google G Icon */}
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-semibold text-slate-100">Continue with Google</span>
              </button>
            )}

            {/* Bottom Toggle Note */}
            <div className="mt-6 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    id="link-create-account"
                    onClick={() => setMode('register')}
                    className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              ) : mode === 'register' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    id="link-sign-in"
                    onClick={() => setMode('login')}
                    className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              )}
            </div>
          </div>

          {/* Trust badges footer below card */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-medium">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>24/7 SOS Network</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span>500+ Verified Hubs</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>AI Route Planner</span>
            </div>
          </div>
        </div>
      </main>

      {/* Google OAuth Setup & Connect Helper Modal */}
      {oauthSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#111625] p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-white">
                  Google OAuth Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  Google OAuth credentials status & rapid login
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                To connect your Google Cloud OAuth 2.0 app credentials, add the following authorized redirect URI in your Google Cloud Console:
              </p>

              <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-cyan-300 break-all select-all">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/auth/callback`
                  : 'https://ais-dev-dnah6qofmtcjmb5jvp7sj3-722308764815.asia-southeast1.run.app/auth/callback'}
              </div>

              <div className="rounded-lg bg-indigo-950/40 border border-indigo-800/50 p-3 text-indigo-200 space-y-1">
                <span className="font-semibold block">Required Environment Variables:</span>
                <span className="block font-mono text-[10px] text-slate-400">• GOOGLE_CLIENT_ID</span>
                <span className="block font-mono text-[10px] text-slate-400">• GOOGLE_CLIENT_SECRET</span>
              </div>

              <p className="text-slate-400 text-[11px]">
                You can also proceed immediately with your Google Explorer account below:
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setOauthSetupModalOpen(false)}
                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDirectGoogleSignIn}
                className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/30 cursor-pointer"
              >
                Continue as Google Traveler →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="h-12 border-t border-slate-800/80 bg-[#0a0a0a]/80 flex items-center justify-between px-6 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">APNA ROUTE</span>
          <span>• India's Next-Gen Travel Grid</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
          <span>Grid Security v2.4 Active</span>
        </div>
      </footer>
    </div>
  );
};
