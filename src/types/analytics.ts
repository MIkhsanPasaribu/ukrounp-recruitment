// Types untuk Analytics Dashboard
export interface AnalyticsOverview {
  total_applications: number;
  accepted_count: number;
  rejected_count: number;
  under_review_count: number;
  interview_count: number;
  attendance_confirmed_count: number;
  interviewed_count: number;
  avg_interview_score: number;
}

export interface FacultyStats {
  [faculty: string]: number;
}

export interface StatusStats {
  [status: string]: number;
}

export interface EducationStats {
  [level: string]: number;
}

export interface GenderStats {
  [gender: string]: number;
}

export interface SkillsStats {
  [skill: string]: number;
}

export interface InterviewerPerformance {
  [interviewerId: string]: {
    name: string;
    totalSessions: number;
    totalScore: number;
    averageScore: string;
    recommendations: {
      SANGAT_DIREKOMENDASIKAN: number;
      DIREKOMENDASIKAN: number;
      CUKUP: number;
      TIDAK_DIREKOMENDASIKAN: number;
    };
  };
}

export interface TimelineData {
  [date: string]: {
    total: number;
    statuses: {
      [status: string]: number;
    };
  };
}

export interface ConversionFunnel {
  applied: number;
  interview_scheduled: number;
  interview_completed: number;
  accepted: number;
  conversion_rates: {
    application_to_interview: string;
    interview_to_completion: string;
    completion_to_acceptance: string;
  };
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  facultyBreakdown: FacultyStats;
  statusBreakdown: StatusStats;
  educationBreakdown: EducationStats;
  genderBreakdown: GenderStats;
  skillsAnalysis: SkillsStats;
  interviewerPerformance: InterviewerPerformance;
  timeline: TimelineData;
  conversionFunnel: ConversionFunnel;
  metadata: {
    dateFrom?: string;
    dateTo?: string;
    faculty?: string;
    generatedAt: string;
  };
}

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  faculty?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimelineChartData {
  date: string;
  applications: number;
  interviews: number;
  accepted: number;
}

export interface SkillsChartData {
  skill: string;
  count: number;
  percentage: number;
}

export interface InterviewerChartData {
  interviewer: string;
  sessions: number;
  averageScore: number;
  acceptanceRate: number;
}
