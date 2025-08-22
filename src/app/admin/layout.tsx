import { checkRole } from '@utils/roles';
import { redirect } from 'next/navigation';
import AdminSidebar from '@components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkRole('admin');
  if (!isAdmin) redirect('/');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 bg-white">
        {children}
      </div>
    </div>
  );
}
