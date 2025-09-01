# TESTING ASSIGNMENT WORKFLOW

## Step-by-Step Testing Process

### Phase 1: Setup Test Data (Supabase SQL)

#### 1. Run di Supabase SQL Editor:
```sql
-- Copy paste dari file: assign-dummy-to-interviewers.sql
-- Ini akan create 7 dummy applicants dengan status INTERVIEW
```

#### 2. Verify Data Created:
```sql
-- Check interviewer table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interviewers';

-- Check all interviewers
SELECT username, email, "fullName"
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;

-- Check dummy applicants
SELECT nim, "fullName", status, "attendanceConfirmed", "interviewStatus"
FROM applicants 
WHERE nim LIKE '230760%'
ORDER BY nim;
```

### Phase 2: Browser Testing

#### 1. Open Admin Dashboard:
- URL: `http://localhost:3000/admin` 
- Login sebagai admin
- Navigate ke **Interviews** tab

#### 2. Test Assignment dengan Console Open:
1. **Open Browser DevTools (F12)**
2. **Go to Console tab**
3. **Try assign kandidat pertama (NIM: 23076039) ke pewawancara2**
4. **Watch console output untuk:**
   - "Looking for interviewer with username: pewawancara2"
   - "Query result from 'interviewers' table: ..."
   - "All interviewers in database: ..."

### Phase 3: Debug Analysis

#### Expected Success Output:
```
🔍 DEBUG: Looking for interviewer with username: pewawancara2
🔍 DEBUG: Query result from 'interviewers' table: {
  "data": {
    "id": "xxx",
    "username": "pewawancara2", 
    "fullName": "Pewawancara 2",
    "email": "pewawancara2@example.com"
  },
  "error": null
}
✅ Assignment successful
```

#### Expected Error Output (current issue):
```
🔍 DEBUG: Looking for interviewer with username: pewawancara2
🔍 DEBUG: Query result from 'interviewers' table: {
  "data": null,
  "error": { ... }
}
🔍 DEBUG: All interviewers in database: [
  { "username": "pewawancara1", ... },
  { "username": "pewawancara2", ... },
  ...
]
❌ Pewawancara tidak ditemukan
```

### Phase 4: Manual Fallback (if API fails)

#### If assignment via UI fails, manual SQL assignment:
```sql
-- Assign manually via SQL
UPDATE applicants 
SET "assignedInterviewer" = 'pewawancara2', "interviewStatus" = 'ASSIGNED'
WHERE nim = '23076039';

-- Check result
SELECT nim, "fullName", "assignedInterviewer", "interviewStatus"
FROM applicants 
WHERE nim = '23076039';
```

### Phase 5: Verify Full Workflow

#### 1. Check Status Updates:
- Admin dashboard → Manage Applications tab
- Status should change from "Ditinjau" to "Interview" 
- Assigned interviewer should appear

#### 2. Check Interviewer Dashboard:
- Login sebagai pewawancara2
- URL: `http://localhost:3000/interview`
- Should see assigned candidates

#### 3. Check API Endpoints:
```bash
# Test interview-candidates endpoint
curl http://localhost:3000/api/admin/interview-candidates

# Test interview applications for pewawancara2
curl -H "Cookie: auth-token=..." http://localhost:3000/api/interview/applications
```

## Key Files to Monitor:

- ✅ `assign-dummy-to-interviewers.sql` - Setup test data
- ✅ `manual-test-assignment.sql` - Debug queries
- ✅ `src/app/api/admin/interview-workflow/route.ts` - Main API dengan debug logs
- ✅ `src/components/admin/InterviewAssignmentTab.tsx` - Frontend component

## Success Criteria:

1. ✅ Dummy applicants created (7 candidates)
2. ✅ Console shows debug logs
3. ✅ Assignment works via UI (no "pewawancara tidak ditemukan")
4. ✅ Status updates in Manage Applications tab
5. ✅ Assigned candidates appear in interviewer dashboard

## 🎯 IMMEDIATE ACTION: 

**Run assign-dummy-to-interviewers.sql di Supabase, then test assignment dengan browser console open!**
