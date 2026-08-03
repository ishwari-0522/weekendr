'use client';

import React from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your memory book."
      subtitle="Unlock customized local routes, customize budget allocations, and store your favorite spots under a single personal space."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
