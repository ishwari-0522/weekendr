'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import NotificationBell from '../notifications/NotificationBell';
import NotificationPanel from '../notifications/NotificationPanel';

/**
 * HeaderNav: Client-side navigation header checking auth session states.
 */
export default function HeaderNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    fetchUnreadCount, 
    markAsRead, 
    readAll, 
    dismiss 
  } = useNotifications();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  const handleBellClick = () => {
    setPanelOpen(true);
    fetchNotifications();
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="border-b border-border bg-card relative z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground hover:opacity-85 transition duration-150">
              WEEKENDR
            </Link>
          </div>
          
          {/* Center Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition duration-150">
              Explore
            </Link>
            <Link href="/memories" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition duration-150">
              Memories
            </Link>
            <Link href="/about" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition duration-150">
              About
            </Link>
          </nav>
          
          {/* Right Section: Action CTA & User Dropdown */}
          <div className="flex items-center gap-4 relative">
            <Link
              href="/design"
              className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded text-sm font-bold transition duration-200"
            >
              Design My Day
            </Link>
            
            {/* Live Day Route link when authenticated */}
            {isAuthenticated && (
              <Link
                href="/live"
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition px-2 py-1.5"
              >
                Live Day
              </Link>
            )}

            {isAuthenticated && user ? (
              /* Authenticated User Menu Dropdown */
              <div className="flex items-center gap-2">
                <NotificationBell
                  unreadCount={unreadCount}
                  onClick={handleBellClick}
                />

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-black uppercase cursor-pointer hover:bg-primary/30 transition duration-150"
                    aria-label="User profile menu"
                  >
                    {user.full_name ? user.full_name[0] : 'U'}
                  </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-48 bg-[#111622] border border-border rounded-lg shadow-high py-1.5 text-left z-50">
                    <div className="px-4 py-2 border-b border-border/60 text-xs font-semibold text-foreground truncate">
                      {user.full_name}
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/memories"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition"
                    >
                      Memories
                    </Link>
                    <Link
                      href="/profile#settings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-xs text-destructive hover:bg-destructive/10 transition cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            ) : (
              /* Unauthenticated / Guest Options */
              <div className="flex gap-2 items-center">
                <Link
                  href="/login"
                  className="text-xs font-bold text-muted-foreground hover:text-foreground transition px-2 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-bold text-primary-foreground bg-primary/80 hover:bg-primary px-3 py-1.5 rounded transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>

      <NotificationPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onMarkRead={markAsRead}
        onReadAll={readAll}
        onDismiss={dismiss}
      />
    </header>
  );
}
