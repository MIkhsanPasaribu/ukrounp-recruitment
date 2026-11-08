-- Empty-Supabase recovery only. Run as the database owner, never through a browser.
-- Deliberately not rerunnable: any pre-existing target relation/function aborts without changes.
-- Existing API routes must explicitly adopt the RPCs; this file does not change runtime code.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '120s';
SELECT pg_advisory_xact_lock(714203, 1);

DO $$
DECLARE object_name text;
BEGIN
  FOREACH object_name IN ARRAY ARRAY[
    'applicants', 'settings', 'admins', 'session_tokens', 'audit_logs',
    'interviewers', 'interviewer_tokens', 'interview_questions',
    'interview_sessions', 'interview_responses', 'interview_attendance', 'interviewer_assignments'
  ] LOOP
    IF to_regclass(format('public.%I', object_name)) IS NOT NULL THEN
      RAISE EXCEPTION 'Recovery requires absent target tables; public.% already exists. Inspect manually; no data changed.', object_name;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname IN
               ('save_interview_result', 'import_interview_applicants', 'interview_recovery_touch')) THEN
    RAISE EXCEPTION 'Recovery function name already exists; inspect manually';
  END IF;
END $$;

CREATE TABLE public.applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  "fullName" text NOT NULL CHECK (btrim("fullName") <> ''),
  nickname text,
  gender text CHECK (gender IN ('LAKI_LAKI', 'PEREMPUAN')),
  "birthDate" text,
  faculty text,
  department text,
  "studyProgram" text,
  "educationLevel" text CHECK ("educationLevel" IN ('', 'S1', 'D4', 'D3')),
  nim text UNIQUE CHECK (nim = btrim(nim) AND nim <> ''),
  nia text,
  "previousSchool" text,
  "padangAddress" text,
  "phoneNumber" text,
  motivation text,
  "futurePlans" text,
  "whyYouShouldBeAccepted" text,
  "corelDraw" boolean NOT NULL DEFAULT false,
  photoshop boolean NOT NULL DEFAULT false,
  "adobePremierePro" boolean NOT NULL DEFAULT false,
  "adobeAfterEffect" boolean NOT NULL DEFAULT false,
  "autodeskEagle" boolean NOT NULL DEFAULT false,
  "arduinoIde" boolean NOT NULL DEFAULT false,
  "androidStudio" boolean NOT NULL DEFAULT false,
  "visualStudio" boolean NOT NULL DEFAULT false,
  "missionPlaner" boolean NOT NULL DEFAULT false,
  "autodeskInventor" boolean NOT NULL DEFAULT false,
  "autodeskAutocad" boolean NOT NULL DEFAULT false,
  solidworks boolean NOT NULL DEFAULT false,
  "otherSoftware" text,
  -- Base64 document fields stay NULL on spreadsheet import. Drive URLs belong in sourceData.
  "mbtiProof" text,
  photo text,
  "studentCard" text,
  "studyPlanCard" text,
  "igFollowProof" text,
  "tiktokFollowProof" text,
  status text NOT NULL DEFAULT 'SEDANG_DITINJAU'
    CHECK (status IN ('SEDANG_DITINJAU', 'DAFTAR_PENDEK', 'INTERVIEW', 'DITERIMA', 'DITOLAK')),
  "submittedAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "adminNotes" text,
  "statusHistory" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "ipAddress" text,
  "userAgent" text,
  "isEmailVerified" boolean NOT NULL DEFAULT false,
  "isPhoneVerified" boolean NOT NULL DEFAULT false,
  "attendanceConfirmed" boolean NOT NULL DEFAULT false,
  "assignedInterviewer" text,
  "interviewStatus" text NOT NULL DEFAULT 'pending',
  "interviewDateTime" timestamptz,
  "attendanceNIM" text,
  "interviewScore" integer,
  "interviewNotes" text,
  "sourceData" jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof("sourceData") = 'object')
);

CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  "dataType" text NOT NULL DEFAULT 'string' CHECK ("dataType" IN ('string', 'boolean', 'number', 'json')),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL DEFAULT 'system'
);
INSERT INTO public.settings (key, value, "dataType") VALUES ('registrationOpen', 'false', 'boolean')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  "passwordHash" text NOT NULL,
  "fullName" text NOT NULL,
  role text NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR')),
  "isActive" boolean NOT NULL DEFAULT true,
  "lastLoginAt" timestamptz,
  "lastLoginIP" inet,
  "loginAttempts" integer NOT NULL DEFAULT 0,
  "lockedUntil" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.session_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "adminId" uuid NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "lastUsedAt" timestamptz DEFAULT now(),
  "userAgent" text,
  "ipAddress" inet,
  "isRevoked" boolean NOT NULL DEFAULT false,
  "revokedAt" timestamptz
);
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "adminId" uuid REFERENCES public.admins(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text,
  "resourceType" text,
  "resourceId" text,
  details text,
  "ipAddress" inet,
  "userAgent" text,
  success boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.interviewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  "passwordHash" text NOT NULL,
  "fullName" text NOT NULL,
  role text NOT NULL DEFAULT 'INTERVIEWER' CHECK (role IN ('INTERVIEWER', 'HEAD_INTERVIEWER')),
  "isActive" boolean NOT NULL DEFAULT true,
  "lastLoginAt" timestamptz,
  "loginAttempts" integer NOT NULL DEFAULT 0,
  "lockedUntil" timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.applicants ADD CONSTRAINT applicants_assigned_interviewer_fkey
  FOREIGN KEY ("assignedInterviewer") REFERENCES public.interviewers(username) ON UPDATE CASCADE;
CREATE TABLE public.interviewer_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "interviewerId" uuid NOT NULL REFERENCES public.interviewers(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  "expiresAt" timestamptz NOT NULL,
  "isRevoked" boolean NOT NULL DEFAULT false,
  "revokedAt" timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "questionNumber" integer NOT NULL UNIQUE,
  "questionText" text NOT NULL,
  category text,
  "isActive" boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.interview_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nim text NOT NULL UNIQUE,
  applicant_id uuid NOT NULL UNIQUE REFERENCES public.applicants(id),
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  checked_in_by uuid REFERENCES public.admins(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.interviewer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL UNIQUE REFERENCES public.interview_attendance(id),
  interviewer_id uuid NOT NULL REFERENCES public.interviewers(id),
  assigned_by uuid REFERENCES public.admins(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicantId" uuid NOT NULL UNIQUE REFERENCES public.applicants(id),
  "interviewerId" uuid NOT NULL REFERENCES public.interviewers(id),
  assignment_id uuid REFERENCES public.interviewer_assignments(id),
  "interviewDate" timestamptz DEFAULT now(),
  location text,
  status text NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  notes text,
  "totalScore" integer NOT NULL DEFAULT 0,
  "interviewerName" text,
  recommendation text CHECK (recommendation IN ('SANGAT_DIREKOMENDASIKAN', 'DIREKOMENDASIKAN', 'CUKUP', 'TIDAK_DIREKOMENDASIKAN')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.interview_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionId" uuid NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  "questionId" uuid NOT NULL REFERENCES public.interview_questions(id),
  response text NOT NULL CHECK (btrim(response) <> ''),
  score integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("sessionId", "questionId")
);
CREATE INDEX ON public.session_tokens ("adminId");
CREATE INDEX ON public.session_tokens ("expiresAt");
CREATE INDEX ON public.audit_logs ("adminId", "createdAt");
CREATE INDEX ON public.interviewer_tokens ("interviewerId");
CREATE INDEX ON public.interviewer_tokens ("expiresAt");
CREATE INDEX ON public.applicants ("assignedInterviewer");
CREATE INDEX ON public.interview_sessions ("interviewerId");
CREATE INDEX ON public.interview_sessions (assignment_id);
CREATE INDEX ON public.interviewer_assignments (interviewer_id);
CREATE INDEX ON public.interview_responses ("questionId");

CREATE FUNCTION public.interview_recovery_touch() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  NEW := jsonb_populate_record(NEW, jsonb_build_object(TG_ARGV[0], clock_timestamp()));
  RETURN NEW;
END $$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['applicants', 'settings', 'admins'] LOOP
    EXECUTE format('CREATE TRIGGER recovery_touch BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.interview_recovery_touch(''updatedAt'')', table_name);
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY['interviewers', 'interview_attendance', 'interviewer_assignments', 'interview_sessions', 'interview_responses'] LOOP
    EXECUTE format('CREATE TRIGGER recovery_touch BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.interview_recovery_touch(''updated_at'')', table_name);
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY[
    'applicants', 'settings', 'admins', 'session_tokens', 'audit_logs',
    'interviewers', 'interviewer_tokens', 'interview_questions',
    'interview_sessions', 'interview_responses', 'interview_attendance', 'interviewer_assignments'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', table_name);
    EXECUTE format('CREATE POLICY recovery_service_role ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', table_name);
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.interview_recovery_touch() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.interview_recovery_touch() TO service_role;

-- Existing question text, verbatim from database-interview-fresh-start-FIXED.sql.
INSERT INTO public.interview_questions ("questionNumber", "questionText", category) VALUES
(1, 'Ceritakan tentang diri Anda dan latar belakang pendidikan Anda.', 'Personal'),
(2, 'Mengapa Anda tertarik bergabung dengan organisasi ini?', 'Motivasi'),
(3, 'Apa kekuatan dan kelemahan Anda?', 'Personal'),
(4, 'Bagaimana Anda mengatasi konflik dalam tim?', 'Interpersonal'),
(5, 'Ceritakan pengalaman kepemimpinan Anda.', 'Leadership'),
(6, 'Bagaimana Anda mengatur waktu dan prioritas dalam aktivitas sehari-hari?', 'Management'),
(7, 'Apa rencana karir Anda ke depan?', 'Future Planning'),
(8, 'Bagaimana Anda beradaptasi dengan perubahan dan tantangan baru?', 'Adaptability'),
(9, 'Apa kontribusi yang bisa Anda berikan untuk organisasi ini?', 'Contribution'),
(10, 'Bagaimana Anda menangani tekanan dan deadline kerja?', 'Stress Management'),
(11, 'Apakah ada pertanyaan dari Anda untuk kami?', 'Closing');

-- Server must authenticate the interviewer and supply its database ID, never a body/JWT claim alone.
-- responses: [{questionId: UUID, response: nonblank string, score: integer 1..5, notes?: string|null}]
-- p_edit=false requires SCHEDULED/IN_PROGRESS; p_edit=true requires COMPLETED.
-- Returns {sessionId, totalScore, responseCount, status}.
CREATE FUNCTION public.save_interview_result(
  p_session_id uuid, p_interviewer_id uuid, p_responses jsonb,
  p_notes text, p_recommendation text, p_interviewer_name text, p_edit boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $$
DECLARE
  interview public.interview_sessions%ROWTYPE;
  candidate public.applicants%ROWTYPE;
  owner_username text;
  active_count integer;
  total_score integer;
  item jsonb;
BEGIN
  IF p_edit IS NULL OR p_interviewer_id IS NULL THEN
    RAISE EXCEPTION 'Interviewer and edit flag are required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO interview FROM public.interview_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR interview."interviewerId" IS DISTINCT FROM p_interviewer_id THEN
    RAISE EXCEPTION 'Session not found or not owned by interviewer' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO candidate FROM public.applicants WHERE id = interview."applicantId" FOR UPDATE;
  SELECT username INTO owner_username FROM public.interviewers
    WHERE id = p_interviewer_id AND "isActive" FOR SHARE;
  IF owner_username IS NULL OR candidate."assignedInterviewer" IS DISTINCT FROM owner_username THEN
    RAISE EXCEPTION 'Current applicant assignment does not match active session owner' USING ERRCODE = '42501';
  END IF;
  IF (p_edit AND interview.status <> 'COMPLETED') OR
     (NOT p_edit AND interview.status NOT IN ('SCHEDULED', 'IN_PROGRESS')) THEN
    RAISE EXCEPTION 'Session state does not allow this submit/edit' USING ERRCODE = '22023';
  END IF;
  IF p_recommendation IS NULL OR p_recommendation NOT IN
    ('SANGAT_DIREKOMENDASIKAN', 'DIREKOMENDASIKAN', 'CUKUP', 'TIDAK_DIREKOMENDASIKAN') THEN
    RAISE EXCEPTION 'Invalid recommendation' USING ERRCODE = '22023';
  END IF;
  IF p_interviewer_name IS NULL OR btrim(p_interviewer_name) = '' THEN
    RAISE EXCEPTION 'Interviewer name is required' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(p_responses) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Responses must be an array' USING ERRCODE = '22023';
  END IF;
  -- Stabilize the active question set, including concurrent inserts/activation changes.
  LOCK TABLE public.interview_questions IN SHARE MODE;
  SELECT count(*) INTO active_count FROM public.interview_questions WHERE "isActive";
  IF active_count = 0 OR jsonb_array_length(p_responses) <> active_count THEN
    RAISE EXCEPTION 'All active questions must be answered exactly once' USING ERRCODE = '22023';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_responses) LOOP
    IF jsonb_typeof(item) IS DISTINCT FROM 'object'
      OR jsonb_typeof(item->'questionId') IS DISTINCT FROM 'string'
      OR jsonb_typeof(item->'response') IS DISTINCT FROM 'string'
      OR btrim(item->>'response') = ''
      OR jsonb_typeof(item->'score') IS DISTINCT FROM 'number'
      OR (item->>'score') !~ '^[1-5]$'
      OR (item ? 'notes' AND jsonb_typeof(item->'notes') NOT IN ('string', 'null')) THEN
      RAISE EXCEPTION 'Invalid response: UUID questionId, nonblank answer, integer score 1..5 required' USING ERRCODE = '22023';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.interview_questions
                   WHERE id = (item->>'questionId')::uuid AND "isActive") THEN
      RAISE EXCEPTION 'Unknown or inactive question' USING ERRCODE = '22023';
    END IF;
  END LOOP;
  IF (SELECT count(DISTINCT (value->>'questionId')::uuid) FROM jsonb_array_elements(p_responses)) <> active_count THEN
    RAISE EXCEPTION 'Duplicate question IDs' USING ERRCODE = '22023';
  END IF;
  SELECT sum((value->>'score')::integer) INTO total_score FROM jsonb_array_elements(p_responses);
  DELETE FROM public.interview_responses WHERE "sessionId" = p_session_id;
  INSERT INTO public.interview_responses ("sessionId", "questionId", response, score, notes)
    SELECT p_session_id, (value->>'questionId')::uuid, value->>'response', (value->>'score')::integer, value->>'notes'
    FROM jsonb_array_elements(p_responses);
  UPDATE public.interview_sessions SET status = 'COMPLETED', "totalScore" = total_score,
    notes = p_notes, recommendation = p_recommendation, "interviewerName" = btrim(p_interviewer_name)
    WHERE id = p_session_id;
  UPDATE public.applicants SET "interviewStatus" = 'COMPLETED',
    "interviewScore" = total_score, "interviewNotes" = p_notes WHERE id = interview."applicantId";
  RETURN jsonb_build_object('sessionId', p_session_id, 'totalScore', total_score,
                           'responseCount', active_count, 'status', 'COMPLETED');
END $$;
REVOKE ALL ON FUNCTION public.save_interview_result(uuid, uuid, jsonb, text, text, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_interview_result(uuid, uuid, jsonb, text, text, text, boolean) TO service_role;

-- Admin-authenticated server only. No JWT/auth.uid() authorization in the database.
-- Input: [{email,fullName,nim,phoneNumber?,birthDate?,padangAddress?,department?,studyProgram?,
--          motivation?,whyYouShouldBeAccepted?,otherSoftware?,sourceData?: object}].
-- Unknown top-level keys rejected; spreadsheet extras/Drive URLs must be nested in sourceData.
-- Returns {inserted: integer, skipped: integer}. Duplicate batch NIM/email rejected.
CREATE FUNCTION public.import_interview_applicants(p_applicants jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $$
DECLARE
  item jsonb;
  field_name text;
  inserted_count integer;
  batch_count integer;
BEGIN
  IF jsonb_typeof(p_applicants) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Applicants must be an array' USING ERRCODE = '22023';
  END IF;
  batch_count := jsonb_array_length(p_applicants);
  FOR item IN SELECT value FROM jsonb_array_elements(p_applicants) LOOP
    IF jsonb_typeof(item) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION 'Each applicant must be an object' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM jsonb_object_keys(item) AS keys(key) WHERE key NOT IN
      ('email', 'fullName', 'nim', 'phoneNumber', 'birthDate', 'padangAddress', 'department',
       'studyProgram', 'motivation', 'whyYouShouldBeAccepted', 'otherSoftware', 'sourceData')) THEN
      RAISE EXCEPTION 'Unsupported applicant field; put spreadsheet metadata in sourceData' USING ERRCODE = '22023';
    END IF;
    FOREACH field_name IN ARRAY ARRAY['email', 'fullName', 'nim'] LOOP
      IF jsonb_typeof(item->field_name) IS DISTINCT FROM 'string' OR btrim(item->>field_name) = '' THEN
        RAISE EXCEPTION 'email, fullName, nim must be nonblank strings' USING ERRCODE = '22023';
      END IF;
    END LOOP;
    IF lower(btrim(item->>'email')) !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
      RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
    END IF;
    FOREACH field_name IN ARRAY ARRAY['phoneNumber', 'birthDate', 'padangAddress', 'department',
      'studyProgram', 'motivation', 'whyYouShouldBeAccepted', 'otherSoftware'] LOOP
      IF item ? field_name AND jsonb_typeof(item->field_name) NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'Optional applicant fields must be strings or null' USING ERRCODE = '22023';
      END IF;
    END LOOP;
    IF item ? 'sourceData' AND jsonb_typeof(item->'sourceData') IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION 'sourceData must be an object' USING ERRCODE = '22023';
    END IF;
    IF nullif(btrim(item->>'birthDate'), '') IS NOT NULL THEN
      IF (item->>'birthDate') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
        RAISE EXCEPTION 'birthDate must be YYYY-MM-DD' USING ERRCODE = '22023';
      END IF;
      PERFORM (item->>'birthDate')::date;
    END IF;
  END LOOP;
  IF (SELECT count(DISTINCT btrim(value->>'nim')) FROM jsonb_array_elements(p_applicants)) <> batch_count OR
     (SELECT count(DISTINCT lower(btrim(value->>'email'))) FROM jsonb_array_elements(p_applicants)) <> batch_count THEN
    RAISE EXCEPTION 'Duplicate NIM or email within import batch' USING ERRCODE = '22023';
  END IF;
  -- ponytail: table-wide writer lock serializes imports against registration/admin writes;
  -- replace with an identity staging table if import volume makes this a bottleneck.
  LOCK TABLE public.applicants IN SHARE ROW EXCLUSIVE MODE;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_applicants) AS incoming(value)
    JOIN public.applicants a ON a.email = lower(btrim(value->>'email'))
    WHERE a.nim IS DISTINCT FROM btrim(value->>'nim')
  ) THEN
    RAISE EXCEPTION 'Email already belongs to another NIM; entire import rejected' USING ERRCODE = '23505';
  END IF;
  INSERT INTO public.applicants (email, "fullName", nim, "phoneNumber", "birthDate", "padangAddress",
    department, "studyProgram", motivation, "whyYouShouldBeAccepted", "otherSoftware", "sourceData", status)
    SELECT lower(btrim(value->>'email')), btrim(value->>'fullName'), btrim(value->>'nim'),
      value->>'phoneNumber', nullif(btrim(value->>'birthDate'), ''), value->>'padangAddress',
      value->>'department', value->>'studyProgram', value->>'motivation',
      value->>'whyYouShouldBeAccepted', value->>'otherSoftware', coalesce(value->'sourceData', '{}'::jsonb), 'INTERVIEW'
    FROM jsonb_array_elements(p_applicants)
    ON CONFLICT (nim) DO NOTHING;
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN jsonb_build_object('inserted', inserted_count, 'skipped', batch_count - inserted_count);
END $$;
REVOKE ALL ON FUNCTION public.import_interview_applicants(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_interview_applicants(jsonb) TO service_role;

-- Runnable regression check. Fixture writes are rolled back by the enclosing subtransaction.
-- Any unexpected result aborts the complete migration; no test accounts/data survive.
DO $$
DECLARE
  owner_id uuid;
  candidate_id uuid;
  session_id uuid;
  answers jsonb;
  result jsonb;
BEGIN
  BEGIN
    result := public.import_interview_applicants('[{"email":"recovery-test@example.invalid","fullName":"Recovery test","nim":"recovery-test","sourceData":{"drive":"https://drive.google.com/test"}}]'::jsonb);
    IF result <> '{"inserted":1,"skipped":0}'::jsonb THEN RAISE EXCEPTION 'Import insert check failed'; END IF;
    result := public.import_interview_applicants('[{"email":"recovery-test@example.invalid","fullName":"Do not overwrite","nim":"recovery-test"}]'::jsonb);
    IF result <> '{"inserted":0,"skipped":1}'::jsonb THEN RAISE EXCEPTION 'Import skip check failed'; END IF;
    BEGIN
      PERFORM public.import_interview_applicants('[{"email":"recovery-test@example.invalid","fullName":"Collision","nim":"other-nim"}]'::jsonb);
      RAISE EXCEPTION 'Cross-NIM email check failed';
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
    INSERT INTO public.interviewers (username, email, "passwordHash", "fullName")
      VALUES ('recovery-test', 'recovery-owner@example.invalid', 'not-a-login-hash', 'Recovery test') RETURNING id INTO owner_id;
    UPDATE public.applicants SET "assignedInterviewer" = 'recovery-test' WHERE nim = 'recovery-test' RETURNING id INTO candidate_id;
    INSERT INTO public.interview_sessions ("applicantId", "interviewerId") VALUES (candidate_id, owner_id) RETURNING id INTO session_id;
    SELECT jsonb_agg(jsonb_build_object('questionId', id, 'response', 'Test answer', 'score', 5)) INTO answers FROM public.interview_questions WHERE "isActive";
    BEGIN
      PERFORM public.save_interview_result(session_id, gen_random_uuid(), answers, 'Test', 'CUKUP', 'Recovery test');
      RAISE EXCEPTION 'Ownership check failed';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
      PERFORM public.save_interview_result(session_id, owner_id, jsonb_set(answers, '{0,score}', '0'), 'Test', 'CUKUP', 'Recovery test');
      RAISE EXCEPTION 'Score validation check failed';
    EXCEPTION WHEN invalid_parameter_value THEN NULL;
    END;
    BEGIN
      PERFORM public.save_interview_result(session_id, owner_id, jsonb_set(answers, '{0}', answers->1), 'Test', 'CUKUP', 'Recovery test');
      RAISE EXCEPTION 'Duplicate question check failed';
    EXCEPTION WHEN invalid_parameter_value THEN NULL;
    END;
    result := public.save_interview_result(session_id, owner_id, answers, 'Test', 'CUKUP', 'Recovery test');
    IF (result->>'totalScore')::integer <> 55 OR NOT EXISTS (
      SELECT 1 FROM public.applicants WHERE id = candidate_id AND "interviewStatus" = 'COMPLETED'
        AND "interviewScore" = 55 AND "interviewNotes" = 'Test' AND "fullName" = 'Recovery test'
        AND photo IS NULL AND "sourceData"->>'drive' = 'https://drive.google.com/test'
    ) THEN RAISE EXCEPTION 'Atomic save/preserved import check failed'; END IF;
    BEGIN
      PERFORM public.save_interview_result(session_id, owner_id, answers - 0, 'Invalid', 'CUKUP', 'Recovery test', true);
      RAISE EXCEPTION 'Question completeness check failed';
    EXCEPTION WHEN invalid_parameter_value THEN NULL;
    END;
    BEGIN
      PERFORM public.save_interview_result(session_id, owner_id, jsonb_set(answers, '{0,response}', '" "'), 'Invalid', 'CUKUP', 'Recovery test', true);
      RAISE EXCEPTION 'Nonblank answer check failed';
    EXCEPTION WHEN invalid_parameter_value THEN NULL;
    END;
    IF (SELECT "totalScore" FROM public.interview_sessions WHERE id = session_id) <> 55
       OR (SELECT count(*) FROM public.interview_responses WHERE "sessionId" = session_id) <> 11 THEN
      RAISE EXCEPTION 'Rejected edit changed saved results';
    END IF;
    answers := jsonb_set(answers, '{0,score}', '4');
    PERFORM public.save_interview_result(session_id, owner_id, answers, 'Edited', 'CUKUP', 'Recovery test', true);
    IF (SELECT count(*) FROM public.interview_responses WHERE "sessionId" = session_id) <> 11
       OR (SELECT "interviewScore" FROM public.applicants WHERE id = candidate_id) <> 54 THEN
      RAISE EXCEPTION 'Edit replacement check failed';
    END IF;
    RAISE EXCEPTION USING ERRCODE = 'ZT001', MESSAGE = 'Rollback successful test fixtures';
  EXCEPTION WHEN SQLSTATE 'ZT001' THEN NULL;
  END;
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;
