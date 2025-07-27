export interface Section1Data {
  email: string;
  mbtiProof: string; // Base64 encoded image
}

export interface Section2Data {
  fullName: string;
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  faculty: string;
  department: string;
  studyProgram: string;
  nim: string;
  nia: string;
  previousSchool: string;
  padangAddress: string;
  phoneNumber: string;
  motivation: string;
  futurePlans: string;
  whyYouShouldBeAccepted: string;
  software: {
    corelDraw: boolean;
    photoshop: boolean;
    adobePremierePro: boolean;
    adobeAfterEffect: boolean;
    autodeskEagle: boolean;
    arduinoIde: boolean;
    androidStudio: boolean;
    visualStudio: boolean;
    missionPlaner: boolean;
    autodeskInventor: boolean;
    autodeskAutocad: boolean;
    solidworks: boolean;
    others: string;
  };
  photo: string; // Base64 encoded image
  studentCard: string; // Base64 encoded image
  studyPlanCard: string; // Base64 encoded image
  igFollowProof: string; // Base64 encoded image
  tiktokFollowProof: string; // Base64 encoded image
}

// Updated FormData interface to work with Prisma
export interface FormData extends Section1Data {
  id?: string; // Prisma CUID
  fullName: string;
  status?: 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  submittedAt?: Date | string;
  
  // Optional fields from Section2Data
  nickname?: string;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
  faculty?: string;
  department?: string;
  studyProgram?: string;
  nim?: string;
  nia?: string;
  previousSchool?: string;
  padangAddress?: string;
  phoneNumber?: string;
  motivation?: string;
  futurePlans?: string;
  whyYouShouldBeAccepted?: string;
  software?: {
    corelDraw: boolean;
    photoshop: boolean;
    adobePremierePro: boolean;
    adobeAfterEffect: boolean;
    autodeskEagle: boolean;
    arduinoIde: boolean;
    androidStudio: boolean;
    visualStudio: boolean;
    missionPlaner: boolean;
    autodeskInventor: boolean;
    autodeskAutocad: boolean;
    solidworks: boolean;
    others: string;
  };
  photo?: string;
  studentCard?: string;
  studyPlanCard?: string;
  igFollowProof?: string;
  tiktokFollowProof?: string;
}

// Interface untuk data aplikasi dengan id yang pasti ada
export interface ApplicationData extends FormData {
  id: string;
}

// Prisma-compatible types
export type Gender = 'MALE' | 'FEMALE';
export type ApplicationStatus = 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';