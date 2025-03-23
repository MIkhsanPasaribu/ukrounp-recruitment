'use client';

import { useState } from 'react';
import Section1Form from '@/components/Section1Form';
import Section2Form from '@/components/Section2Form';
import SuccessMessage from '@/components/SuccessMessage';
import { Section1Data, Section2Data, FormData } from '@/types';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [section1Data, setSection1Data] = useState<Section1Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSection1Submit = (data: Section1Data) => {
    setSection1Data(data);
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handleBackToSection1 = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const handleSection2Submit = async (data: Section2Data) => {
    setIsSubmitting(true);
    
    try {
      // Make sure section1Data is not null before creating formData
      if (!section1Data) {
        throw new Error('Missing email information');
      }
      
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

  // Render the appropriate form based on the current step
  return (
    <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {isSuccess ? (
        <SuccessMessage />
      ) : (
        <>
          {currentStep === 1 && (
            <Section1Form onSubmit={handleSection1Submit} />
          )}
          
          {currentStep === 2 && section1Data && (
            <Section2Form 
              onSubmit={handleSection2Submit} 
              isSubmitting={isSubmitting}
              onBack={handleBackToSection1}
            />
          )}
        </>
      )}
    </main>
  );
}