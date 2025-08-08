'use client';

import { useSearchParams } from 'next/navigation';

export default function RegistrationSuccess() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  
  if (!registered) return null;
  
  return (
    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
      Account created successfully! You can now log in.
    </div>
  );
}