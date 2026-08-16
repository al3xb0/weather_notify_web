import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = {
  title: 'Sign in — Weather Notify',
  description: 'Sign in to manage your weather alerts.',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
