'use client';

import { useState } from 'react';
import Section1Form from '@/components/Section1Form';
import Section2Form from '@/components/Section2Form';
import SuccessMessage from '@/components/SuccessMessage';
import { Section1Data, Section2Data, FormData } from '@/types';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [section1Data, setSection1Data] = useState<Section1Data>({
    email: '',
    paymentProof: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSection1Submit = (data: Section1Data) => {
    setSection1Data(data);
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handleSection2Submit = async (data: Section2Data) => {
    setIsSubmitting(true);
    
    try {
      const formData: FormData = {
        ...section1Data,
        ...data
      };
      
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        window.scrollTo(0, 0);
      } else {
        alert('Error submitting form: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            ITitanix Recruitment
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Join our team and be part of something amazing!
          </p>
        </div>

        {isSuccess ? (
          <SuccessMessage />
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className={`flex-1 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <span className={`w-8 h-8 rounded-full inline-flex items-center justify-center mr-2 ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </span>
                  <span>Basic Information</span>
                </div>
                <div className="w-10 h-1 bg-gray-200 mx-2"></div>
                <div className={`flex-1 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <span className={`w-8 h-8 rounded-full inline-flex items-center justify-center mr-2 ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </span>
                  <span>Personal Details</span>
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <Section1Form onSubmit={handleSection1Submit} />
            )}

            {currentStep === 2 && (
              <Section2Form 
                onSubmit={handleSection2Submit} 
                isSubmitting={isSubmitting} 
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}