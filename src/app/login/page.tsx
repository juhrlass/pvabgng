import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login - PVABGNG',
  description: 'Login to your PVABGNG account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">PVABGNG</h1>
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link 
              href="#" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact administrator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}