'use client';

import { useState } from 'react';

interface AdminHeaderButtonsProps {
  isRegistrationOpen: boolean;
  registrationStatusLoading: boolean;
  hasApplications: boolean;
  onToggleRegistration: () => void;
  onExportCSV: () => void;
  onLogout: () => void;
}

export default function AdminHeaderButtons({
  isRegistrationOpen,
  registrationStatusLoading,
  hasApplications,
  onToggleRegistration,
  onExportCSV,
  onLogout
}: AdminHeaderButtonsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop buttons - hidden on mobile */}
      <div className="hidden md:flex space-x-4">
        <button
          onClick={onToggleRegistration}
          disabled={registrationStatusLoading}
          className={`px-4 py-2 rounded-md font-medium ${
            isRegistrationOpen
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {registrationStatusLoading
            ? "Updating..."
            : isRegistrationOpen
            ? "Close Registration"
            : "Open Registration"}
        </button>

        <button
          onClick={onExportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          disabled={!hasApplications}
        >
          Export to CSV
        </button>

        <button
          onClick={onLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Logout
        </button>
      </div>
      
      {/* Mobile menu button - visible only on mobile */}
      <div className="md:hidden">
        <button 
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="absolute right-4 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  onToggleRegistration();
                  setMobileMenuOpen(false);
                }}
                disabled={registrationStatusLoading}
                className={`w-full text-left px-4 py-2 text-sm ${
                  isRegistrationOpen
                    ? "text-red-700 hover:bg-red-100"
                    : "text-green-700 hover:bg-green-100"
                }`}
              >
                {registrationStatusLoading
                  ? "Updating..."
                  : isRegistrationOpen
                  ? "Close Registration"
                  : "Open Registration"}
              </button>
              
              <button
                onClick={() => {
                  onExportCSV();
                  setMobileMenuOpen(false);
                }}
                disabled={!hasApplications}
                className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-100"
              >
                Export to CSV
              </button>
              
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}