import { checkRole } from '@utils/roles';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkRole('admin');
  if (!isAdmin) redirect('/');

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
