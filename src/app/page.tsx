// src/app/home/page.tsx
import InvestorsPage from '@app/investors/page';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar is now part of the layout, no need to add it here */}

      {/* Main Content (Investor List) */}
      <div className="flex-1 p-8 bg-white">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to the Investor Directory!
        </h1>
        <p className="text-gray-600 mb-6">
          Explore our list of amazing investors.
        </p>
        <InvestorsPage />
      </div>
    </div>
  );
}
