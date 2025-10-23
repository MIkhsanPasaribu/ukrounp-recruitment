"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function DeveloperPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const socialLinks = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/m.ikhsanp1/",
      color: "from-purple-600 to-pink-600",
      hoverColor: "hover:shadow-purple-500/50",
      svg: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/mikhsanpasaribu",
      color: "from-blue-600 to-blue-800",
      hoverColor: "hover:shadow-blue-500/50",
      svg: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      url: "https://github.com/MIkhsanPasaribu",
      color: "from-gray-700 to-gray-900",
      hoverColor: "hover:shadow-gray-500/50",
      svg: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "Website",
      url: "https://mikhsanpasaribu.vercel.app",
      color: "from-green-600 to-emerald-600",
      hoverColor: "hover:shadow-green-500/50",
      svg: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z" />
        </svg>
      ),
    },
  ];

  const skills = [
    { name: "React & Next.js", level: 95, color: "bg-blue-500" },
    { name: "TypeScript", level: 90, color: "bg-blue-600" },
    { name: "Node.js", level: 88, color: "bg-green-500" },
    { name: "AI & Machine Learning", level: 85, color: "bg-purple-500" },
    { name: "Desain Database", level: 92, color: "bg-orange-500" },
    { name: "Desain UI/UX", level: 87, color: "bg-pink-500" },
  ];

  const achievements = [
    { icon: "🎓", title: "Mahasiswa", desc: "Universitas Negeri Padang" },
    {
      icon: "🚀",
      title: "Full-Stack Developer",
      desc: "Aplikasi Web Modern",
    },
    { icon: "🤖", title: "AI Engineer", desc: "Solusi Generative AI" },
    {
      icon: "⚡",
      title: "Pembelajar Cepat",
      desc: "Selalu Eksplorasi Teknologi Baru",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-30"></div>

      {/* Animated Gradient Orbs */}
      <div
        className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: "transform 0.5s ease-out",
        }}
      ></div>
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{
          transform: `translate(-${mousePosition.x}px, -${mousePosition.y}px)`,
          transition: "transform 0.5s ease-out",
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}
        >
          <div className="inline-block mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-2xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              {/* Simpan foto Anda sebagai /public/images/ikhsan.jpg */}
              <Image
                src="/images/ikhsan.jpg"
                alt="M. Ikhsan Pasaribu"
                width={400}
                height={400}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            M. Ikhsan Pasaribu
          </h1>

          <div className="inline-block px-6 py-2 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all">
            <span className="mr-2">🎓</span>
            NIM: 23076039
          </div>

          <p className="text-xl md:text-2xl text-gray-700 font-medium mb-2">
            Pendidikan Teknik Informatika
          </p>

          <p className="text-lg text-gray-600 font-medium mb-4">
            Universitas Negeri Padang
          </p>

          <div className="flex justify-center items-center gap-3 mt-4">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold shadow-md">
              💻 Full-Stack Developer
            </span>
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-semibold shadow-md">
              🤖 Generative AI Engineer
            </span>
          </div>
        </div>

        {/* About Section */}
        <div
          className={`max-w-4xl mx-auto mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-300">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">👨‍💻</span>
              Tentang Saya
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Seorang developer yang passionate dalam membangun aplikasi web
              modern dan scalable, serta mengeksplorasi dunia Generative AI.
              Saya menggabungkan kreativitas dengan keahlian teknis untuk
              menciptakan solusi inovatif yang memberikan dampak nyata.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Saat ini sedang menempuh pendidikan sebagai mahasiswa Program
              Studi Pendidikan Teknik Informatika di Universitas Negeri Padang.
              Saya terus belajar dan mengimplementasikan teknologi terkini untuk
              menyelesaikan masalah di dunia nyata.
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div
          className={`max-w-4xl mx-auto mb-16 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">⚡</span>
              Keahlian Teknis
            </h2>
            <div className="space-y-6">
              {skills.map((skill, index) => (
                <div
                  key={skill.name}
                  className="group"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${
                      index * 0.1
                    }s forwards`,
                    opacity: 0,
                  }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                      {skill.name}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.color} rounded-full transition-all duration-1000 ease-out transform origin-left group-hover:scale-105`}
                      style={{
                        width: isVisible ? `${skill.level}%` : "0%",
                        transition: `width 1s ease-out ${index * 0.1}s`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div
          className={`max-w-4xl mx-auto mb-16 transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Sorotan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.title}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  {achievement.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
              Mari Terhubung! 🚀
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {socialLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative bg-gradient-to-br ${link.color} p-6 rounded-xl text-white text-center transform transition-all duration-300 hover:scale-110 hover:shadow-2xl ${link.hoverColor} overflow-hidden`}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${
                      index * 0.1
                    }s forwards`,
                    opacity: 0,
                  }}
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>

                  <div className="relative z-10">
                    <div className="mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {link.svg}
                    </div>
                    <div className="font-bold text-lg">{link.name}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full text-white font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 cursor-default">
            <span className="mr-2">✨</span>
            Dibuat dengan semangat dan kode
            <span className="ml-2">✨</span>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            © {new Date().getFullYear()}{" "}
            <a
              href="https://github.com/MIkhsanPasaribu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 hover:underline transition-colors duration-200 font-semibold"
            >
              M. Ikhsan Pasaribu
            </a>{" "}
            (23076039). Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* Add keyframes animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
