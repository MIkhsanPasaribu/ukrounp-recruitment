'use client';

import { useState } from 'react';
import { Section1Data } from '@/types';
import FileUpload from './FileUpload';

interface Section1FormProps {
  onSubmit: (data: Section1Data) => void;
}

export default function Section1Form({ onSubmit }: Section1FormProps) {
  const [email, setEmail] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const [errors, setErrors] = useState<{ email?: string; paymentProof?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; paymentProof?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!paymentProof) {
      newErrors.paymentProof = 'Payment proof is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        email,
        paymentProof
      });
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Step 1: Basic Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            className={`block w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bukti Pembayaran <span className="text-red-500">*</span>
          </label>
          <FileUpload
            onFileSelected={setPaymentProof}
            error={errors.paymentProof}
          />
          {errors.paymentProof && <p className="mt-1 text-sm text-red-600">{errors.paymentProof}</p>}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue to Step 2
          </button>
        </div>
      </form>
    </div>
  );
}