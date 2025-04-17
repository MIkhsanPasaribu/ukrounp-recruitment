/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Section2Data } from '@/types';
import FileUpload from './FileUpload';
import { 
  validateRequired, 
  validatePhoneNumber, 
  validateDate, 
  validateTextLength,
  validateSelect,
  validateFileType,
  validateFileSize
} from '@/utils/validation';

interface Section2FormProps {
  onSubmit: (data: Section2Data) => void;
  isSubmitting: boolean;
  onBack: () => void; // Add this new prop
}

export default function Section2Form({ onSubmit, isSubmitting, onBack }: Section2FormProps) {
  const [formData, setFormData] = useState<Section2Data>({
    fullName: '',
    nickname: '',
    gender: 'male',
    birthDate: '',
    faculty: '',
    department: '',
    studyProgram: '',
    nim: '',
    nia: '',
    previousSchool: '',
    padangAddress: '',
    phoneNumber: '',
    motivation: '',
    futurePlans: '',
    whyYouShouldBeAccepted: '',
    software: {
      corelDraw: false,
      photoshop: false,
      adobePremierePro: false,
      adobeAfterEffect: false,
      autodeskEagle: false,
      arduinoIde: false,
      androidStudio: false,
      visualStudio: false,
      missionPlaner: false,
      autodeskInventor: false,
      autodeskAutocad: false,
      solidworks: false,
      others: '',
    },
    photo: '',
    studentCard: '',
    studyPlanCard: '',
    igFollowProof: '',
    tiktokFollowProof: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const getNiaFromNim = (nim: string): string => {
    // Remove any non-numeric characters
    const numericNim = nim.replace(/\D/g, '');
    
    if (!numericNim) return '';
    
    // Convert to integer and then to hexadecimal
    try {
      const hexValue = parseInt(numericNim, 10).toString(16).toUpperCase();
      return `15.${hexValue}`;
    } catch (error) {
      return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSoftwareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      software: {
        ...prev.software,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'fullName', 'nickname', 'gender', 'birthDate', 'faculty', 
      'department', 'studyProgram', 'nim' , 'previousSchool', 'padangAddress', 
      'phoneNumber', 'motivation', 'futurePlans', 'whyYouShouldBeAccepted',
      'photo', 'studentCard', 'studyPlanCard', 'igFollowProof', 'tiktokFollowProof'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof Section2Data]) {
        newErrors[field] = `This field is required`;
      }
    });
    
    // Validate phone number
    if (formData.phoneNumber && !/^[0-9+\-\s]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    const fullNameValidation = validateRequired(formData.fullName, 'Nama lengkap');
    if (!fullNameValidation.valid && fullNameValidation.message) newErrors.fullName = fullNameValidation.message;
    
    const nicknameValidation = validateRequired(formData.nickname, 'Nama panggilan');
    if (!nicknameValidation.valid && nicknameValidation.message) newErrors.nickname = nicknameValidation.message;
    
    // Validate gender
    if (!formData.gender) {
      newErrors.gender = "Jenis kelamin harus dipilih";
    } else if (formData.gender !== 'male' && formData.gender !== 'female') {
      newErrors.gender = "Jenis kelamin harus laki-laki atau perempuan";
    }
    
    // Validate date
    const birthDateValidation = validateDate(formData.birthDate, 'Tanggal lahir');
    if (!birthDateValidation.valid && birthDateValidation.message) {
      newErrors.birthDate = birthDateValidation.message;
    }
    
    // Validate select fields
    const facultyValidation = validateSelect(formData.faculty, 'Fakultas');
    if (!facultyValidation.valid && facultyValidation.message) {
      newErrors.faculty = facultyValidation.message;
    }
    
    const departmentValidation = validateSelect(formData.department, 'Jurusan');
    if (!departmentValidation.valid && departmentValidation.message) {
      newErrors.department = departmentValidation.message;
    }
    
    const studyProgramValidation = validateSelect(formData.studyProgram, 'Program studi');
    if (!studyProgramValidation.valid && studyProgramValidation.message) {
      newErrors.studyProgram = studyProgramValidation.message;
    }

    // NIM validation
    const nimValidation = validateRequired(formData.nim, 'NIM');
    if (!nimValidation.valid && nimValidation.message) {
      newErrors.nim = nimValidation.message;
    } else if (!/^\d+$/.test(formData.nim)) {
      newErrors.nim = 'NIM harus berupa angka';
    }
    
    // Validate other required fields
    const previousSchoolValidation = validateRequired(formData.previousSchool, 'Asal sekolah');
    if (!previousSchoolValidation.valid && previousSchoolValidation.message) {
      newErrors.previousSchool = previousSchoolValidation.message;
    }
    
    const padangAddressValidation = validateRequired(formData.padangAddress, 'Alamat di Padang');
    if (!padangAddressValidation.valid && padangAddressValidation.message) {
      newErrors.padangAddress = padangAddressValidation.message;
    }
    
    // Validate phone number
    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.valid && phoneValidation.message) {
      newErrors.phoneNumber = phoneValidation.message;
    }
    
    // Validate text areas with minimum length
    const motivationValidation = validateTextLength(formData.motivation, 'Motivasi', 10, 500);
    if (!motivationValidation.valid && motivationValidation.message) {
      newErrors.motivation = motivationValidation.message;
    }
    
    const futurePlansValidation = validateTextLength(formData.futurePlans, 'Rencana masa depan', 10, 500);
    if (!futurePlansValidation.valid && futurePlansValidation.message) {
      newErrors.futurePlans = futurePlansValidation.message;
    }
    
    const whyAcceptedValidation = validateTextLength(formData.whyYouShouldBeAccepted, 'Alasan diterima', 10, 500);
    if (!whyAcceptedValidation.valid && whyAcceptedValidation.message) {
      newErrors.whyYouShouldBeAccepted = whyAcceptedValidation.message;
    }

    // Validate file uploads
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFileSizeMB = 10;
    
    // Helper function to validate file uploads
    const validateFileUpload = (
      file: string,
      fieldName: string,
      label: string,
      allowedTypes: string[] = allowedImageTypes
    ) => {
      if (!file) {
        newErrors[fieldName] = `${label} harus diunggah`;
        return;
      }

      // Validate file size first
      const sizeValidation = validateFileSize(file, maxFileSizeMB);
      if (!sizeValidation.valid && sizeValidation.message) {
        newErrors[fieldName] = sizeValidation.message;
        return;
      }

      // Then validate file type
      const typeValidation = validateFileType(file, allowedTypes, label);
      if (!typeValidation.valid && typeValidation.message) {
        newErrors[fieldName] = typeValidation.message;
      }
    };

    // Validate all file uploads
    validateFileUpload(formData.photo, 'photo', 'Pasfoto');
    validateFileUpload(formData.studentCard, 'studentCard', 'Kartu mahasiswa');
    validateFileUpload(
      formData.studyPlanCard,
      'studyPlanCard',
      'KRS',
      [...allowedImageTypes, 'application/pdf']
    );
    validateFileUpload(formData.igFollowProof, 'igFollowProof', 'Bukti follow IG');
    validateFileUpload(
      formData.tiktokFollowProof,
      'tiktokFollowProof',
      'Bukti follow TikTok'
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const calculatedNia = getNiaFromNim(formData.nim);
      
      const formDataWithNia = {
        ...formData,
        nia: calculatedNia
      };
      
      onSubmit(formDataWithNia);
    } else {
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Step 2: Personal Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>
            
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Panggilan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.nickname ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.nickname}
              />
              {errors.nickname && <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>}
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.gender ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.gender}
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>
            
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.birthDate}
              />
              {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">
                Fakultas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="faculty"
                name="faculty"
                value={formData.faculty}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.faculty ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.faculty}
              />
              {errors.faculty && <p className="mt-1 text-sm text-red-600">{errors.faculty}</p>}
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Departemen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.department ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.department}
              />
              {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
            </div>
            
            <div>
              <label htmlFor="studyProgram" className="block text-sm font-medium text-gray-700 mb-1">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studyProgram"
                name="studyProgram"
                value={formData.studyProgram}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.studyProgram ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.studyProgram}
              />
              {errors.studyProgram && <p className="mt-1 text-sm text-red-600">{errors.studyProgram}</p>}
            </div>

            <div>
              <label htmlFor="previousSchool" className="block text-sm font-medium text-gray-700 mb-1">
                Sekolah Asal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="previousSchool"
                name="previousSchool"
                value={formData.previousSchool}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.previousSchool ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.previousSchool}
              />
              {errors.previousSchool && <p className="mt-1 text-sm text-red-600">{errors.previousSchool}</p>}
            </div>
            
            <div>
              <label htmlFor="nim" className="block text-sm font-medium text-gray-700 mb-1">
                NIM (Nomor Induk Mahasiswa) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nim"
                name="nim"
                value={formData.nim}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.nim ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.nim}
                placeholder="Masukkan NIM Anda"
              />
              {errors.nim && <p className="mt-1 text-sm text-red-600">{errors.nim}</p>}
              
              {formData.nim && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">NIA (Nomor Induk Anggota):</p>
                  <p className="font-medium text-blue-600">{getNiaFromNim(formData.nim)}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="padangAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat di Padang <span className="text-red-500">*</span>
              </label>
              <textarea
                id="padangAddress"
                name="padangAddress"
                rows={3}
                value={formData.padangAddress}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.padangAddress ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.padangAddress}
              />
              {errors.padangAddress && <p className="mt-1 text-sm text-red-600">{errors.padangAddress}</p>}
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor HP/WA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.phoneNumber}
              />
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
            </div>
          </div>
          
          {/* Motivation and Plans */}
          <div>
            <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
              Motivasi Bergabung dengan Robotik <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motivation"
              name="motivation"
              rows={4}
              value={formData.motivation}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${errors.motivation ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              aria-invalid={!!errors.motivation}
            />
            {errors.motivation && <p className="mt-1 text-sm text-red-600">{errors.motivation}</p>}
          </div>
          
          <div>
            <label htmlFor="futurePlans" className="block text-sm font-medium text-gray-700 mb-1">
              Rencana Setelah Bergabung <span className="text-red-500">*</span>
            </label>
            <textarea
              id="futurePlans"
              name="futurePlans"
              rows={4}
              value={formData.futurePlans}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${errors.futurePlans ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              aria-invalid={!!errors.futurePlans}
            />
            {errors.futurePlans && <p className="mt-1 text-sm text-red-600">{errors.futurePlans}</p>}
          </div>
          
          <div>
            <label htmlFor="whyYouShouldBeAccepted" className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Anda Layak Diterima <span className="text-red-500">*</span>
            </label>
            <textarea
              id="whyYouShouldBeAccepted"
              name="whyYouShouldBeAccepted"
              rows={4}
              value={formData.whyYouShouldBeAccepted}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${errors.whyYouShouldBeAccepted ? 'border-red-500' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              aria-invalid={!!errors.whyYouShouldBeAccepted}
            />
            {errors.whyYouShouldBeAccepted && <p className="mt-1 text-sm text-red-600">{errors.whyYouShouldBeAccepted}</p>}
          </div>
          
          {/* Software Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Software yang Sudah Pernah Digunakan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="corelDraw"
                  name="corelDraw"
                  checked={formData.software.corelDraw}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="corelDraw" className="ml-2 block text-sm text-gray-700">
                  CorelDraw
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="photoshop"
                  name="photoshop"
                  checked={formData.software.photoshop}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="photoshop" className="ml-2 block text-sm text-gray-700">
                  Photoshop
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adobePremierePro"
                  name="adobePremierePro"
                  checked={formData.software.adobePremierePro}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="adobePremierePro" className="ml-2 block text-sm text-gray-700">
                  Adobe Premiere Pro
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adobeAfterEffect"
                  name="adobeAfterEffect"
                  checked={formData.software.adobeAfterEffect}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="adobeAfterEffect" className="ml-2 block text-sm text-gray-700">
                  Adobe After Effect
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autodeskEagle"
                  name="autodeskEagle"
                  checked={formData.software.autodeskEagle}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autodeskEagle" className="ml-2 block text-sm text-gray-700">
                  Autodesk Eagle
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="arduinoIde"
                  name="arduinoIde"
                  checked={formData.software.arduinoIde}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="arduinoIde" className="ml-2 block text-sm text-gray-700">
                  Arduino IDE
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="androidStudio"
                  name="androidStudio"
                  checked={formData.software.androidStudio}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="androidStudio" className="ml-2 block text-sm text-gray-700">
                  Android Studio
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visualStudio"
                  name="visualStudio"
                  checked={formData.software.visualStudio}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="visualStudio" className="ml-2 block text-sm text-gray-700">
                  Visual Studio
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="missionPlaner"
                  name="missionPlaner"
                  checked={formData.software.missionPlaner}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="missionPlaner" className="ml-2 block text-sm text-gray-700">
                  Mission Planer
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autodeskInventor"
                  name="autodeskInventor"
                  checked={formData.software.autodeskInventor}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autodeskInventor" className="ml-2 block text-sm text-gray-700">
                  Autodesk Inventor
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autodeskAutocad"
                  name="autodeskAutocad"
                  checked={formData.software.autodeskAutocad}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autodeskAutocad" className="ml-2 block text-sm text-gray-700">
                  Autodesk AutoCAD
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="solidworks"
                  name="solidworks"
                  checked={formData.software.solidworks}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="solidworks" className="ml-2 block text-sm text-gray-700">
                  Solidworks
                </label>
              </div>
            </div>
            
            <div className="mt-3">
              <label htmlFor="others" className="block text-sm font-medium text-gray-700 mb-1">
                Lainnya
              </label>
              <input
                type="text"
                id="others"
                name="others"
                value={formData.software.others}
                onChange={handleSoftwareChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Document Uploads */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pasfoto <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelected={(base64) => setFormData(prev => ({ ...prev, photo: base64 }))}
                error={errors.photo}
              />
              {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kartu Tanda Mahasiswa <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelected={(base64) => setFormData(prev => ({ ...prev, studentCard: base64 }))}
                error={errors.studentCard}
              />
              {errors.studentCard && <p className="mt-1 text-sm text-red-600">{errors.studentCard}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kartu Rencana Studi <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelected={(base64) => setFormData(prev => ({ ...prev, studyPlanCard: base64 }))}
                error={errors.studyPlanCard}
              />
              {errors.studyPlanCard && <p className="mt-1 text-sm text-red-600">{errors.studyPlanCard}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bukti Follow Akun IG <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelected={(base64) => setFormData(prev => ({ ...prev, igFollowProof: base64 }))}
                error={errors.igFollowProof}
              />
              {errors.igFollowProof && <p className="mt-1 text-sm text-red-600">{errors.igFollowProof}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bukti Follow Akun TikTok <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelected={(base64) => setFormData(prev => ({ ...prev, tiktokFollowProof: base64 }))}
                error={errors.tiktokFollowProof}
              />
              {errors.tiktokFollowProof && <p className="mt-1 text-sm text-red-600">{errors.tiktokFollowProof}</p>}
            </div>
          </div>

          {/* Submit Button and Back to Step 1 Button */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Back to Step 1
            </button>
          
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
