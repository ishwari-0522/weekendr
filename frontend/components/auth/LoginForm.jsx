'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

/**
 * LoginForm: Responsive form controller handling user authentication and guest paths.
 */
export default function LoginForm() {
  const { login, continueAsGuest } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        // Recover post-login redirect path
        const redirectTo = sessionStorage.getItem('redirect_to') || '/design';
        sessionStorage.removeItem('redirect_to');
        router.push(redirectTo);
      } else {
        setErrorMessage(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to the login service. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClick = () => {
    continueAsGuest();
    const redirectTo = sessionStorage.getItem('redirect_to') || '/design';
    sessionStorage.removeItem('redirect_to');
    router.push(redirectTo);
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1.5">Welcome Back</h2>
        <p className="text-xs text-muted-foreground">Log in to resume your journey, edit saved outings, or capture memories.</p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/25 text-destructive rounded text-[11px] font-semibold leading-relaxed">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="login-email">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-secondary/15 border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-secondary/15 border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground text-xs font-bold rounded transition-all duration-300 ease-[var(--ease-premium-out)] disabled:opacity-50 cursor-pointer shadow-low hover:shadow-medium mt-2"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60"></div>
        </div>
        <span className="relative px-3 bg-[#111622] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Or
        </span>
      </div>

      <button
        onClick={handleGuestClick}
        className="w-full p-3 border border-border bg-transparent hover:border-primary text-muted-foreground hover:text-foreground text-xs font-semibold rounded transition duration-200 cursor-pointer"
      >
        Continue as Guest
      </button>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-bold transition">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
