'use client';

import React from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Resume your wanderlust."
      subtitle="Sign in to WEEKENDR to access saved itineraries, update neighborhood preferences, and manage your private memory book."
    >
      <LoginForm />
    </AuthLayout>
  );
}
