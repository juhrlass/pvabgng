import { Metadata } from 'next';
import SignupForm from '@/components/SignupForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up - PVABGNG',
  description: 'Create a new PVABGNG account',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">PVABGNG</h1>
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create a new account
          </p>
        </div>
        
        <SignupForm />
        
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}