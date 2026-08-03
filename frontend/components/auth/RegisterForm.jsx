'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

/**
 * RegisterForm: Handles user registrations validations and error triggers.
 */
export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(fullName, email, password);
      if (res.success) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to the registration service. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1.5">Create an Account</h2>
        <p className="text-xs text-muted-foreground">Join WEEKENDR to unlock customized day itineraries and save memories.</p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/25 text-destructive rounded text-[11px] font-semibold leading-relaxed">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-primary/10 border border-primary/25 text-primary rounded text-[11px] font-semibold leading-relaxed">
          ✓ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="reg-name">
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 bg-secondary/15 border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="reg-email">
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-secondary/15 border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="reg-password">
            Password (Min 6 chars)
          </label>
          <input
            id="reg-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-secondary/15 border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="reg-confirm">
            Confirm Password
          </label>
          <input
            id="reg-confirm"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 bg-secondary/15 border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground text-xs font-bold rounded transition-all duration-300 ease-[var(--ease-premium-out)] disabled:opacity-50 cursor-pointer shadow-low hover:shadow-medium mt-2"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-border/60">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-bold transition">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
