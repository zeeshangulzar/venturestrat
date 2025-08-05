// components/Sidebar.tsx
'use client';  // Marking this file as a Client Component

import Link from 'next/link';
import { usePathname } from 'next/navigation';  // Import usePathname to get the current route

const Sidebar = () => {
  const pathname = usePathname();  // Get the current pathname

  // Helper function to apply active class based on current route
  const getLinkClass = (path: string) => {
    return pathname === path
      ? 'text-blue-500 font-semibold'  // Active link styling
      : 'text-white hover:text-gray-300';  // Inactive link styling
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-6 sticky top-0 h-screen hidden lg:block">
      <h2 className="text-2xl font-bold mb-4 text-white">Menu</h2>
      <div className="space-y-4">
        {/* Highlight Home link when active */}
        <Link href="/" className={`block text-lg ${getLinkClass('/')}`}>
          Home
        </Link>
        {/* Highlight Investors List link when active */}
        <Link href="/investors" className={`block text-lg ${getLinkClass('/investors')}`}>
          Investors List
        </Link>
        {/* You can add more navigation links here */}
      </div>
    </div>
  );
};

export default Sidebar;
