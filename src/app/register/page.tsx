import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = {
  title: 'Create an account — Weather Notify',
  description: 'Create an account and get alerted when the weather turns.',
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
