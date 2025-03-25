'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

// Create a separate client component for the actual content
function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Unit Kegiatan Robotika Universitas Negeri Padang</h1>
        </div>
      </header>
      {children}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use client-side only rendering for the body
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Use a longer timeout to ensure all browser extensions have finished
    // modifying the DOM before we mount our component
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        {mounted ? (
          <ClientLayout>{children}</ClientLayout>
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        )}
      </body>
    </html>
  );
}