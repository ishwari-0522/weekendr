'use client';

import React from 'react';
import useAuth from '../../hooks/useAuth';

/**
 * LiveHeader: Custom editorial companion greeting panel referencing user profile names.
 */
export default function LiveHeader() {
  const { user } = useAuth();
  
  // Extract first name
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Ishwari';

  // Get current hour for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="text-left space-y-1.5 border-b border-border/40 pb-6 mb-8">
      <h1 className="page-title text-foreground tracking-tight text-3xl font-extrabold uppercase">
        {getGreeting()}, {firstName}.
      </h1>
      <p className="text-sm text-muted-foreground italic font-medium">
        "Today is all about making memories."
      </p>
    </div>
  );
}
export { LiveHeader };
