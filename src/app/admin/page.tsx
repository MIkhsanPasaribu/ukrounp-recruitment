'use client';

import { useState, useEffect } from 'react';
import { FormData } from '@/types';

export default function AdminPage() {
  const [applications, setApplications] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication - in a real app, use proper auth
    if (password === 'admin123') { // Change this to a secure password
      setIsAuthenticated(true);
      fetchApplications();
    } else {
      setError('Invalid password');
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data.applications);
    } catch (err) {
      setError('Error fetching applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={authenticate}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      
      {loading ? (
        <p>Loading applications...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Full Name</th>
                <th className="px-4 py-2 border">Faculty</th>
                <th className="px-4 py-2 border">Department</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-2 border">{app.email}</td>
                  <td className="px-4 py-2 border">{app.fullName}</td>
                  <td className="px-4 py-2 border">{app.faculty}</td>
                  <td className="px-4 py-2 border">{app.department}</td>
                  <td className="px-4 py-2 border">{app.phoneNumber}</td>
                  <td className="px-4 py-2 border">
                    <button 
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                      onClick={() => alert(JSON.stringify(app, null, 2))}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}