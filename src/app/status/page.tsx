'use client';

import { useState } from 'react';
import Link from 'next/link';

interface StatusResponse {
  success: boolean;
  status?: string;
  submittedAt?: string;
  message?: string;
}

export default function StatusPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
      } else {
        setError(data.message || 'Failed to retrieve application status');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while checking your status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      {/* Back button to landing page */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Check Application Status</h1>
      
      <form onSubmit={checkStatus} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </div>
      </form>
      
      {status && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-semibold mb-4">Application Status</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Status:</p>
            <p className="font-medium">{status.status}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Submitted on:</p>
            <p className="font-medium">{new Date(status.submittedAt!).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}