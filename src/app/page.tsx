"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
//import { useRouter } from 'next/navigation';

export default function Home() {
  //const router = useRouter();
  const [showVideo, setShowVideo] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });

  // Add floating animation effect to the quick ball
  useEffect(() => {
    const floatInterval = setInterval(() => {
      setBallPosition({
        x: Math.sin(Date.now() / 1000) * 5,
        y: Math.cos(Date.now() / 1500) * 5,
      });
    }, 50);

    return () => clearInterval(floatInterval);
  }, []);

  const toggleVideo = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowVideo(!showVideo);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/ukro full.jpg"
          alt="UKRO Group"
          fill
          priority
          className="object-cover"
          style={{
            filter: "brightness(0.3)", // Reduce brightness to 30%
            opacity: 0.8, // Add some transparency
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <div className="max-w-4xl">
          {/* Add the robot hand image above the title */}
          <div className="flex justify-center mb-8">
            <Image
              src="/GAZA - UKRO.gif"
              alt="Logo Unit Kegiatan Robotika UNP"
              width={150}
              height={150}
              priority
              className="animate-pulse"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Unit Kegiatan Robotika <br /> Universitas Negeri Padang
          </h1>
          <p className="text-xl mb-8 text-white">
            MARI BERKARYA DENGAN TEKNOLOGI!!!✊🏼
          </p>
          
          {/* Navigation Menu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/form"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300"
            >
              DAFTAR
            </Link>

            <Link
              href="/status"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300"
            >
              CHECK STATUS
            </Link>

            <Link
              href="/admin"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300"
            >
              ADMIN
            </Link>
          </div>
          
          {/* Social Media Links */}
          <div className="flex justify-center space-x-6 mb-10">
            <a
              href="https://www.instagram.com/robotic_unp?igsh=MWZhM2x0bTdvZGN2MQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              INSTAGRAM
            </a>

            <a
              href="https://www.tiktok.com/@robotic_unp?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              TIKTOK
            </a>
          </div>
        </div>
      </div>

      {/* Quick Ball for Video - Enhanced with floating animation */}
      <div 
        className="fixed bottom-8 right-8 z-50"
        style={{
          transform: `translate(${ballPosition.x}px, ${ballPosition.y}px)`,
          transition: 'transform 0.5s ease-out'
        }}
      >
        <div className="relative">
          {/* Pulsing ring effect */}
          <div className={`absolute inset-0 rounded-full bg-blue-400 opacity-30 ${showVideo ? '' : 'animate-ping'}`}></div>
          
          {/* Main button */}
          <button
            onClick={toggleVideo}
            className={`relative bg-gradient-to-r from-blue-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 transform hover:scale-110 hover:rotate-12 ${
              isAnimating ? "animate-ping-once" : ""
            }`}
            aria-label="Show UKRO UNP Video"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-8 w-8 transition-all duration-500 ${showVideo ? "rotate-90 scale-110" : ""}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={showVideo 
                  ? "M6 18L18 6M6 6l12 12" 
                  : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"}
              />
              {!showVideo && (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              )}
            </svg>
          </button>
          
          {/* Text label that appears on hover */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {showVideo ? "Close Video" : "Watch Video"}
          </div>
        </div>
      </div>

      {/* Video Modal - Enhanced with better animations */}
      {showVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-backdropFadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleVideo();
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full animate-modalEntrance">
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <h3 className="text-xl font-semibold flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 mr-2 animate-pulse" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                Kenali UKRO UNP
              </h3>
              <button 
                onClick={toggleVideo}
                className="text-white hover:text-gray-200 transition-colors duration-200 transform hover:rotate-90 hover:scale-125"
                aria-label="Close video"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            <div className="relative pt-[56.25%] w-full">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/6M-3vLsxfJU"
                title="UKRO UNP Profile Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 bg-opacity-70 py-6 text-center relative z-10">
        <p className="text-gray-300">
          © {new Date().getFullYear()} Unit Kegiatan Robotika UNP. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
