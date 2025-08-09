import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import ProfileForm from '@/components/ProfileForm';

export const metadata: Metadata = {
  title: 'Edit Profile - PVABGNG',
  description: 'Edit your PVABGNG profile',
};

// Server component to get user data
async function getUserData() {
  const cookieStore = await cookies();
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

export default async function ProfilePage() {
  const userData = await getUserData();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Update your profile information and upload a profile photo.
          </p>
        </div>
        
        <ProfileForm initialData={{
          id: userData.sub,
          name: userData.name || '',
          email: userData.email || '',
        }} />
      </div>
    </div>
  );
}