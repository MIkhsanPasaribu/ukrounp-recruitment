ikhsan@ukro-recruitment-vm:/var/www/ukro-recruitment$ npx tsc --noemit
src/app/api/interview/forms/submit/route.ts:121:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "interview_responses", never, "POST">', gave the following error.
    Argument of type '{ sessionId: any; questionId: any; response: any; score: number; notes: any; }[]' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "interview_responses", never, "POST">', gave the following error.
    Argument of type '{ sessionId: any; questionId: any; response: any; score: number; notes: any; }[]' is not assignable to parameter of type 'never[]'.
      Type '{ sessionId: any; questionId: any; response: any; score: number; notes: any; }' is not assignable to type 'never'.

121       .insert(validResponses);
                  ~~~~~~~~~~~~~~


src/app/api/interview/forms/submit/route.ts:168:15 - error TS2345: Argument of type 'Record<string, string | number>' is not assignable to parameter of type 'never'.

168       .update(sessionUpdateData)
                  ~~~~~~~~~~~~~~~~~

src/app/api/interview/forms/submit/route.ts:197:19 - error TS2345: Argument of type 'Record<string, string>' is not assignable to parameter of type 'never'.

197           .update(basicUpdateData)
                      ~~~~~~~~~~~~~~~

src/app/api/interview/sessions/[sessionId]/route.ts:159:20 - error TS2352: Conversion of type 'undefined' to type 'ResponseData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.

159         response: (existingResponse as ResponseData)?.response || "",
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/app/api/interview/sessions/[sessionId]/route.ts:160:17 - error TS2352: Conversion of type 'undefined' to type 'ResponseData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.

160         score: (existingResponse as ResponseData)?.score || 0,
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/app/api/interview/sessions/[sessionId]/route.ts:161:17 - error TS2352: Conversion of type 'undefined' to type 'ResponseData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.

161         notes: (existingResponse as ResponseData)?.notes || "",
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/app/api/interview/sessions/route.ts:120:25 - error TS2339: Property 'id' does not exist on type 'never'.

120         existingSession.id
                            ~~

src/app/api/interview/sessions/route.ts:154:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "interview_sessions", never, "POST">', gave the following error.
    Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "interview_sessions", never, "POST">', gave the following error.
    Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never[]'.
      Type 'Record<string, unknown>' is missing the following properties from type 'never[]': length, pop, push, concat, and 35 more.

154       .insert(sessionData as Record<string, unknown>)
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


src/app/api/interview/sessions/route.ts:185:70 - error TS2339: Property 'id' does not exist on type 'never'.

185     console.log("✅ Interview session created successfully:", session.id);
                                                                         ~~

src/app/api/submit/route.ts:70:8 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "applicants", never, "POST">', gave the following error.
    Argument of type 'Record<string, unknown>[]' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "applicants", never, "POST">', gave the following error.
    Type 'Record<string, unknown>' is not assignable to type 'never'.

70       .insert([applicationData as Record<string, unknown>])
          ~~~~~~


src/app/api/update-application/route.ts:221:15 - error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.

221       .update(updateObject as Record<string, unknown>)
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/auth-interviewer.ts:70:13 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "interviewer_tokens", never, "POST">', gave the following error.
    Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "interviewer_tokens", never, "POST">', gave the following error.
    Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never[]'.
      Type 'Record<string, unknown>' is missing the following properties from type 'never[]': length, pop, push, concat, and 35 more.

70     .insert(tokenData as Record<string, unknown>)
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


src/lib/auth-interviewer.ts:151:28 - error TS2352: Conversion of type 'null' to type 'InterviewerData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.

151   const interviewerTyped = interviewer as InterviewerData;
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/auth-interviewer.ts:201:15 - error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.

201       .update(updateData as Record<string, unknown>)
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/auth-interviewer.ts:216:13 - error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.

216     .update(resetData as Record<string, unknown>)
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/auth-interviewer.ts:239:13 - error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.

239     .update(revokeData as Record<string, unknown>)
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/auth.ts:166:13 - error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.

166     .update(revokeData as Record<string, unknown>)
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/auth.ts:179:13 - error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.

179     .update(revokeData as Record<string, unknown>)
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/auth.ts:243:17 - error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.

243         .update(updateData as Record<string, unknown>)
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/auth.ts:258:15 - error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'never'.

258       .update(resetData as Record<string, unknown>)
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Found 20 errors in 7 files.

Errors  Files
     3  src/app/api/interview/forms/submit/route.ts:121
     3  src/app/api/interview/sessions/[sessionId]/route.ts:159
     3  src/app/api/interview/sessions/route.ts:120
     1  src/app/api/submit/route.ts:70
     1  src/app/api/update-application/route.ts:221
     5  src/lib/auth-interviewer.ts:70
     4  src/lib/auth.ts:166