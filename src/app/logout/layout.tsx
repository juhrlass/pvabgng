import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logout - PVABGNG',
  description: 'Logout from your PVABGNG account',
};

export default function LogoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}