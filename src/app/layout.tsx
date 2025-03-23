'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

// Metadata needs to be in a separate component or exported differently when using 'use client'
export const metadata: Metadata = {
  title: 'ITitanix Recruitment',
  description: 'Join the ITitanix team and be part of something amazing!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This useEffect will run only on the client side
  useEffect(() => {
    // Any client-side initialization can go here
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">ITitanix Recruitment</h1>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}