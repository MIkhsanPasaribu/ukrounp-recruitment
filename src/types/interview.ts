// Types untuk sistem wawancara

export interface InterviewerUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "INTERVIEWER" | "HEAD_INTERVIEWER";
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  applicantId: string;
  interviewerId: string;
  interviewDate?: string;
  location?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
  totalScore?: number;
  recommendation?:
    | "SANGAT_DIREKOMENDASIKAN"
    | "DIREKOMENDASIKAN"
    | "CUKUP"
    | "TIDAK_DIREKOMENDASIKAN";
  createdAt: string;
  updatedAt: string;
  applicants?: Applicant;
  interviewers?: InterviewerUser;
}

export interface InterviewResponse {
  id: string;
  sessionId: string;
  questionId: string;
  response?: string;
  score: number; // 1-5
  notes?: string;
  createdAt: string;
  interview_questions?: InterviewQuestion;
}

export interface InterviewFormData {
  question: InterviewQuestion;
  response: string;
  score: number;
  notes: string;
  responseId?: string;
}

export interface InterviewCandidate extends Applicant {
  hasInterview: boolean;
  sessionId?: string;
  interviewStatus?: string;
  interviewDate?: string;
  totalScore?: number;
}

export interface Applicant {
  id: string;
  email: string;
  fullName: string;
  nickname?: string;
  gender?: string;
  birthDate?: string;
  faculty?: string;
  department?: string;
  studyProgram?: string;
  nim?: string;
  nia?: string;
  educationLevel?: string;
  phoneNumber?: string;
  status: string;
  updatedAt: string;
}

export interface InterviewerAuthState {
  token: string | null;
  interviewer: InterviewerUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface InterviewSessionCreate {
  applicantId: string;
  interviewDate?: string;
  location?: string;
  notes?: string;
}

export interface InterviewFormSubmit {
  sessionId: string;
  responses: Array<{
    questionId: string;
    response: string;
    score: number;
    notes: string;
  }>;
  sessionNotes?: string;
  recommendation?:
    | "SANGAT_DIREKOMENDASIKAN"
    | "DIREKOMENDASIKAN"
    | "CUKUP"
    | "TIDAK_DIREKOMENDASIKAN";
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
}
