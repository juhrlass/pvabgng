import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard - PVABGNG',
  description: 'Your PVABGNG dashboard',
};

// Server component to get user data
async function getUserData() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  const userData = await verifyToken(token);
  if (!userData) {
    redirect('/login');
  }
  
  return userData;
}

export default async function DashboardPage() {
  const userData = await getUserData();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Welcome, {userData.name || userData.email}!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is a protected page that only authenticated users can access.
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-md font-medium mb-2">Your Account Information</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{userData.sub}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{userData.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{userData.name || 'Not provided'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{userData.role || 'User'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}