export interface Section1Data {
  email: string;
  paymentProof: string; // Base64 encoded image
}

export interface Section2Data {
  fullName: string;
  nickname: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  faculty: string;
  department: string;
  studyProgram: string;
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

export interface FormData extends Section1Data, Section2Data {}