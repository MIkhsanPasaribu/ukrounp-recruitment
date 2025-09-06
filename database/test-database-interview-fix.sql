-- TEST SCRIPT SETELAH PERBAIKAN DATABASE
-- Jalankan setelah menjalankan fix-interview-database.sql

-- === TEST 1: VERIFIKASI STRUKTUR TABEL ===
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name IN (
    'applicants', 'interviewers', 'interview_sessions', 
    'interview_questions', 'interview_responses', 'interviewer_tokens',
    'interview_attendance', 'interviewer_assignments'
)
GROUP BY table_name
ORDER BY table_name;

-- === TEST 2: CEK FOREIGN KEY CONSTRAINTS ===
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('interview_sessions', 'interview_responses', 'interviewer_tokens', 'interview_attendance', 'interviewer_assignments')
ORDER BY tc.table_name;

-- === TEST 3: CEK SAMPLE DATA ===
-- Cek interview questions
SELECT COUNT(*) as total_questions FROM interview_questions WHERE "isActive" = true;

-- Cek applicants dengan status INTERVIEW
SELECT COUNT(*) as interview_candidates FROM applicants WHERE status = 'INTERVIEW';

-- Cek interviewers
SELECT COUNT(*) as total_interviewers FROM interviewers WHERE "isActive" = true;

-- === TEST 4: TEST INSERT ATTENDANCE ===
-- Insert sample attendance (gunakan NIM yang ada di applicants)
INSERT INTO interview_attendance (id, nim, applicant_id, status, notes)
SELECT 
    gen_random_uuid(),
    a.nim,
    a.id,
    'PRESENT',
    'Test attendance dari script'
FROM applicants a 
WHERE a.status = 'INTERVIEW' 
LIMIT 1
ON CONFLICT (nim) DO UPDATE SET 
    status = EXCLUDED.status,
    notes = EXCLUDED.notes;

-- === TEST 5: TEST INSERT ASSIGNMENT ===
-- Insert sample assignment
INSERT INTO interviewer_assignments (id, attendance_id, interviewer_id, status, notes)
SELECT 
    gen_random_uuid(),
    att.id,
    i.id,
    'ASSIGNED',
    'Test assignment dari script'
FROM interview_attendance att
CROSS JOIN interviewers i
WHERE i."isActive" = true
LIMIT 1
ON CONFLICT (attendance_id) DO UPDATE SET
    status = EXCLUDED.status,
    notes = EXCLUDED.notes;

-- === TEST 6: TEST INSERT INTERVIEW SESSION ===
-- Insert sample interview session
INSERT INTO interview_sessions (id, "applicantId", "interviewerId", "interviewDate", location, status, assignment_id)
SELECT 
    gen_random_uuid(),
    att.applicant_id,
    ia.interviewer_id,
    NOW(),
    'Ruang Interview 1',
    'SCHEDULED',
    ia.id
FROM interview_attendance att
JOIN interviewer_assignments ia ON att.id = ia.attendance_id
LIMIT 1
ON CONFLICT DO NOTHING;

-- === TEST 7: VERIFIKASI TEST DATA ===
SELECT 
    'interview_attendance' as table_name,
    COUNT(*) as record_count
FROM interview_attendance
UNION ALL
SELECT 
    'interviewer_assignments' as table_name,
    COUNT(*) as record_count
FROM interviewer_assignments
UNION ALL
SELECT 
    'interview_sessions' as table_name,
    COUNT(*) as record_count
FROM interview_sessions;

-- === SUCCESS MESSAGE ===
SELECT 
    '✅ DATABASE INTERVIEW SYSTEM BERHASIL DISETUP!' as message,
    NOW() as completed_at;
