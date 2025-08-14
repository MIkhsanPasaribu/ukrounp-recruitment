"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

// Create a separate client component for the actual content
function ClientLayout({ children }: { children: React.ReactNode }) {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Start the text animation
    const textAnimationInterval = setInterval(() => {
      const textElement = document.getElementById("running-text");
      if (textElement) {
        textElement.style.transform = `translateX(${-scrollPosition % 100}px)`;
      }
    }, 50);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(textAnimationInterval);
    };
  }, [scrollPosition]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-pattern"></div>
        </div>

        {/* Logo and Title Container */}
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center flex-col sm:flex-row space-y-2 sm:space-y-0">
            {/* UKRO Logo and Title */}
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0">
                <Image
                  src="/GAZA - UKRO.gif"
                  alt="UKRO Logo"
                  width={45}
                  height={45}
                  className="sm:w-[50px] sm:h-[50px] rounded-full"
                />
              </div>

              {/* Title and Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white">
                  UKRO KM UNP
                </h1>
                <p className="text-xs sm:text-sm text-gray-200">
                  Recruitment Platform
                </p>
              </div>
            </div>

            {/* Marquee Text - Hidden on small mobile */}
            <div className="hidden sm:block overflow-hidden flex-1 ml-0 sm:ml-4">
              <h1
                id="running-text"
                className="text-sm sm:text-xl lg:text-3xl font-bold text-white whitespace-nowrap animate-marquee"
              >
                Unit Kegiatan Robotika Universitas Negeri Padang • Unit Kegiatan
                Robotika Universitas Negeri Padang •
              </h1>
            </div>
          </div>
        </div>

        {/* Animated bottom border */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-gradient"></div>
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
      <head>
        <link rel="icon" href="/GAZA - UKRO.gif" />
        <title>OPREC UKRO UNP</title>
        <meta
          name="description"
          content="Recruitment platform for Unit Kegiatan Robotika Universitas Negeri Padang"
        />
      </head>
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
