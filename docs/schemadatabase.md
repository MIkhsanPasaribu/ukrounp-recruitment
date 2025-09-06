create table public.admins (
  id uuid not null,
  username text not null,
  email text not null,
  "passwordHash" text not null,
  "fullName" text not null,
  "isActive" boolean not null default true,
  "lastLoginAt" timestamp without time zone null,
  "loginAttempts" integer not null default 0,
  "lockedUntil" timestamp without time zone null,
  "createdAt" timestamp without time zone not null default now(),
  "updatedAt" timestamp without time zone not null,
  role public.admin_role not null default 'SUPER_ADMIN'::admin_role,
  constraint admins_pkey primary key (id),
  constraint admins_email_key unique (email),
  constraint admins_username_key unique (username)
) TABLESPACE pg_default;

create trigger update_admins_updated_at BEFORE
update on admins for EACH row
execute FUNCTION update_updated_at_column ();

create table public.applicants (
  id uuid not null,
  email text not null,
  "fullName" text not null,
  nickname text null,
  "birthDate" text null,
  faculty text null,
  department text null,
  "studyProgram" text null,
  nim text null,
  nia text null,
  "previousSchool" text null,
  "padangAddress" text null,
  "phoneNumber" text null,
  motivation text null,
  "futurePlans" text null,
  "whyYouShouldBeAccepted" text null,
  "corelDraw" boolean not null default false,
  photoshop boolean not null default false,
  "adobePremierePro" boolean not null default false,
  "adobeAfterEffect" boolean not null default false,
  "autodeskEagle" boolean not null default false,
  "arduinoIde" boolean not null default false,
  "androidStudio" boolean not null default false,
  "visualStudio" boolean not null default false,
  "missionPlaner" boolean not null default false,
  "autodeskInventor" boolean not null default false,
  "autodeskAutocad" boolean not null default false,
  solidworks boolean not null default false,
  "otherSoftware" text null,
  "mbtiProof" text null,
  photo text null,
  "studentCard" text null,
  "studyPlanCard" text null,
  "igFollowProof" text null,
  "tiktokFollowProof" text null,
  "submittedAt" timestamp without time zone not null default now(),
  "updatedAt" timestamp without time zone not null,
  "educationLevel" public.education_level null,
  gender public.gender null,
  status public.application_status not null default 'SEDANG_DITINJAU'::application_status,
  "interviewStatus" character varying(50) null default 'pending'::character varying,
  "assignedInterviewer" character varying(50) null,
  "interviewDateTime" timestamp without time zone null,
  "attendanceConfirmed" boolean null default false,
  "attendanceNIM" character varying(20) null,
  "interviewScore" integer null,
  "interviewNotes" text null,
  constraint applicants_pkey primary key (id),
  constraint applicants_email_key unique (email)
) TABLESPACE pg_default;

create trigger update_applicants_updated_at BEFORE
update on applicants for EACH row
execute FUNCTION update_updated_at_column ();

create trigger update_applicants_updatedat BEFORE
update on applicants for EACH row
execute FUNCTION update_applicants_updatedat_column ();

create table public.audit_logs (
  id text not null,
  "adminId" uuid not null,
  action text not null,
  details text null,
  "ipAddress" text null,
  "userAgent" text null,
  "createdAt" timestamp without time zone not null default now(),
  resource text null,
  constraint audit_logs_pkey primary key (id),
  constraint audit_logs_adminid_fkey foreign KEY ("adminId") references admins (id) on delete set null
) TABLESPACE pg_default;

create table public.interview_attendance (
  id uuid not null default gen_random_uuid (),
  nim text not null,
  applicant_id uuid not null,
  checked_in_at timestamp with time zone null default now(),
  checked_in_by uuid null,
  status text null default 'PRESENT'::text,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint interview_attendance_pkey primary key (id),
  constraint interview_attendance_nim_key unique (nim),
  constraint fk_interview_attendance_admin foreign KEY (checked_in_by) references admins (id) on delete set null,
  constraint fk_interview_attendance_applicant foreign KEY (applicant_id) references applicants (id) on delete CASCADE,
  constraint interview_attendance_status_check check (
    (
      status = any (
        array['PRESENT'::text, 'ABSENT'::text, 'LATE'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_interview_attendance_nim on public.interview_attendance using btree (nim) TABLESPACE pg_default;

create index IF not exists idx_interview_attendance_applicant on public.interview_attendance using btree (applicant_id) TABLESPACE pg_default;

create trigger update_interview_attendance_updated_at BEFORE
update on interview_attendance for EACH row
execute FUNCTION update_updated_at_column ();

create table public.interview_questions (
  id uuid not null default gen_random_uuid (),
  "questionNumber" integer not null,
  "questionText" text not null,
  category text not null,
  "maxScore" integer null default 5,
  "isActive" boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint interview_questions_pkey primary key (id)
) TABLESPACE pg_default;

create table public.interview_responses (
  id uuid not null default gen_random_uuid (),
  "sessionId" uuid not null,
  "questionId" uuid not null,
  response text null,
  score integer null,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint interview_responses_pkey primary key (id),
  constraint interview_responses_questionId_fkey foreign KEY ("questionId") references interview_questions (id) on delete CASCADE,
  constraint interview_responses_sessionId_fkey foreign KEY ("sessionId") references interview_sessions (id) on delete CASCADE,
  constraint interview_responses_score_check check (
    (
      (score >= 1)
      and (score <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_interview_responses_session_id on public.interview_responses using btree ("sessionId") TABLESPACE pg_default;

create index IF not exists idx_interview_responses_question_id on public.interview_responses using btree ("questionId") TABLESPACE pg_default;

create table public.interview_sessions (
  id uuid not null default gen_random_uuid (),
  "applicantId" uuid not null,
  "interviewerId" uuid not null,
  "interviewDate" timestamp with time zone null,
  location text null,
  notes text null,
  status text null default 'SCHEDULED'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint interview_sessions_pkey primary key (id),
  constraint interview_sessions_applicantId_fkey foreign KEY ("applicantId") references applicants (id) on delete CASCADE,
  constraint interview_sessions_interviewerId_fkey foreign KEY ("interviewerId") references interviewers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_interview_sessions_applicant_id on public.interview_sessions using btree ("applicantId") TABLESPACE pg_default;

create index IF not exists idx_interview_sessions_interviewer_id on public.interview_sessions using btree ("interviewerId") TABLESPACE pg_default;

create table public.interviewer_assignments (
  id uuid not null default gen_random_uuid (),
  attendance_id uuid not null,
  interviewer_id uuid not null,
  assigned_by uuid null,
  assigned_at timestamp with time zone null default now(),
  scheduled_at timestamp with time zone null,
  status text null default 'ASSIGNED'::text,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint interviewer_assignments_pkey primary key (id),
  constraint interviewer_assignments_attendance_id_key unique (attendance_id),
  constraint fk_interviewer_assignments_admin foreign KEY (assigned_by) references admins (id) on delete set null,
  constraint interviewer_assignments_attendance_id_fkey foreign KEY (attendance_id) references interview_attendance (id) on delete CASCADE,
  constraint interviewer_assignments_interviewer_id_fkey foreign KEY (interviewer_id) references interviewers (id) on delete CASCADE,
  constraint interviewer_assignments_status_check check (
    (
      status = any (
        array[
          'ASSIGNED'::text,
          'IN_PROGRESS'::text,
          'COMPLETED'::text,
          'CANCELLED'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_interviewer_assignments_attendance on public.interviewer_assignments using btree (attendance_id) TABLESPACE pg_default;

create index IF not exists idx_interviewer_assignments_interviewer on public.interviewer_assignments using btree (interviewer_id) TABLESPACE pg_default;

create trigger update_interviewer_assignments_updated_at BEFORE
update on interviewer_assignments for EACH row
execute FUNCTION update_updated_at_column ();

create table public.interviewer_tokens (
  id uuid not null default gen_random_uuid (),
  "interviewerId" uuid not null,
  token text not null,
  "expiresAt" timestamp with time zone not null,
  "isRevoked" boolean null default false,
  "revokedAt" timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint interviewer_tokens_pkey primary key (id),
  constraint interviewer_tokens_token_key unique (token),
  constraint interviewer_tokens_interviewerId_fkey foreign KEY ("interviewerId") references interviewers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_interviewer_tokens_interviewer_id on public.interviewer_tokens using btree ("interviewerId") TABLESPACE pg_default;

create index IF not exists idx_interviewer_tokens_token on public.interviewer_tokens using btree (token) TABLESPACE pg_default;

create table public.interviewers (
  id uuid not null default gen_random_uuid (),
  username text not null,
  email text not null,
  "passwordHash" text not null,
  "fullName" text not null,
  role public.interviewer_role null default 'INTERVIEWER'::interviewer_role,
  "isActive" boolean null default true,
  "lastLoginAt" timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint interviewers_pkey primary key (id),
  constraint interviewers_email_key unique (email),
  constraint interviewers_username_key unique (username)
) TABLESPACE pg_default;

create trigger update_interviewers_updated_at BEFORE
update on interviewers for EACH row
execute FUNCTION update_updated_at_column ();

create table public.session_tokens (
  id text not null,
  "adminId" uuid not null,
  token text not null,
  "expiresAt" timestamp without time zone not null,
  "createdAt" timestamp without time zone not null default now(),
  "isRevoked" boolean not null default false,
  "revokedAt" timestamp without time zone null,
  constraint session_tokens_pkey primary key (id),
  constraint session_tokens_token_key unique (token),
  constraint session_tokens_adminid_fkey foreign KEY ("adminId") references admins (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.settings (
  id text not null,
  key text not null,
  value text not null,
  "createdAt" timestamp without time zone not null default now(),
  "updatedAt" timestamp without time zone not null,
  constraint settings_pkey primary key (id),
  constraint settings_key_key unique (key)
) TABLESPACE pg_default;

create trigger update_settings_updated_at BEFORE
update on settings for EACH row
execute FUNCTION update_updated_at_column ();