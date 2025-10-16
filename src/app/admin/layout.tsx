import AdminSidebar from '@components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
