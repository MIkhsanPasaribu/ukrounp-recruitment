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

// NEW: Type untuk attendance/absensi
export interface InterviewAttendance {
  id: string;
  nim: string;
  applicantId: string;
  checkedInAt: string;
  checkedInBy?: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  applicants?: Applicant;
  admins?: { id: string; username: string; fullName: string };
}

// NEW: Type untuk assignment pewawancara
export interface InterviewerAssignment {
  id: string;
  applicantId: string;
  interviewerId: string;
  assignedBy?: string;
  assignedAt: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  applicants?: Applicant;
  interviewers?: InterviewerUser;
  admins?: { id: string; username: string; fullName: string };
}

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

// Enum definitions
export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
}

export enum AssignmentStatus {
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Base interview session interface
export interface InterviewSession {
  id: string;
  applicantId: string;
  interviewerId: string;
  assignmentId?: string; // NEW: Reference to interviewer assignment
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
  assignments?: InterviewerAssignment; // NEW: Assignment relationship
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
  // NEW: Assignment information
  assignmentId?: string;
  assignedInterviewer?: string;
  assignedInterviewerName?: string;
  attendanceStatus?: "PRESENT" | "ABSENT" | "LATE";
  checkedInAt?: string;
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
  interviewerName?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasMore: boolean;
}

// Request types
export interface CreateAttendanceRequest {
  nim: string;
  status?: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceRequest {
  id: string;
  status?: AttendanceStatus;
  notes?: string;
}

export interface CreateAssignmentRequest {
  nim: string;
  interviewerId: string;
  scheduledAt?: string;
  notes?: string;
}

export interface UpdateAssignmentRequest {
  id: string;
  interviewerId?: string;
  scheduledAt?: string;
  status?: AssignmentStatus;
  notes?: string;
}
export interface AttendanceCreateRequest {
  nim: string;
  status?: "PRESENT" | "ABSENT" | "LATE";
  notes?: string;
}

export interface InterviewerAssignmentRequest {
  applicantId: string;
  interviewerId: string;
  notes?: string;
}

export interface InterviewerAssignmentBulkRequest {
  assignments: Array<{
    applicantId: string;
    interviewerId: string;
    notes?: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
}
