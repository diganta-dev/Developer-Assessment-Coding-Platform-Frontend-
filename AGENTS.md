<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Architectural Guidelines

## 1. Static Site Export (`output: "export"`)
- This project is configured with `output: "export"` in `next.config.ts`.
- **NEVER use `"use client"` in `page.tsx` files**. Keep all `page.tsx` files as Server Components.
- `page.tsx` files should export `Metadata`, render server layout/navigation, and embed interactive client components wrapped in `<Suspense>`.
- All client-side hooks (`useState`, `useEffect`, `useSearchParams`, `@tanstack/react-query`, DOM event handlers) must be placed inside dedicated client components in `src/components/`, not in `page.tsx`.

## 2. React Query Mutation Guidelines
- Keep mutation hooks in `src/hook/` pure: they should only define `mutationFn`.
- **Do NOT** perform `queryClient.invalidateQueries`, toast messages, or side-effects inside mutation hooks in `src/hook/`.
- Handle all `onSuccess`, `onError`, toast notifications, and cache invalidations (`queryClient.invalidateQueries`) inside the calling components.

---

# Master Architecture & Implementation Source of Truth

## 1. Architecture Overview

### Backend Architecture
```text
Express Router (src/app/router/index.ts)
  └── Module Router (e.g., assessment.route.ts)
        ├── Auth Middleware: auth(allowedRoles...) & checkAuth
        ├── Validation Middleware: validateRequest(ZodSchema)
        └── Controller (e.g., assessment.controller.ts)
              └── Service Layer (e.g., assessment.service.ts)
                    └── Prisma Client (PostgreSQL DB & Transactions)
```

### Frontend Architecture
```text
Server Page (src/app/**/page.tsx - Server Component, Metadata, Suspense)
  └── Client Component (src/components/** - "use client", UI, state, forms)
        └── Custom Hook (src/hook/** - pure useQuery / useMutation)
              └── API Layer (src/api/** - apiClient with ofetch)
                    └── Backend API (/api/v1/**)
```

### Data Flow Rules
1. **API Layer (`src/api/`):** All direct HTTP communication uses the configured `apiClient` (`ofetch` instance with credentials included). No component or hook calls `fetch` or `axios` directly.
2. **Hook Layer (`src/hook/`):** Pure TanStack Query hooks. Encapsulate query keys, parameters, and `mutationFn`. No toast notifications, cache invalidation, or UI state inside mutation hooks.
3. **Component Layer (`src/components/`):** Orchestrates UI states (loading, error, empty, success, disabled), user interactions, form validation, toast notifications, dialogs, and cache invalidations upon mutation success.

---

## 2. Frontend Route Matrix

| Route Path | Access / Role Guard | Primary Component | Current Status |
| :--- | :--- | :--- | :--- |
| `/` | Public | Marketing Home | Complete |
| `/login` | Public (Unauthenticated) | `LoginForm` | Complete |
| `/register` | Public (Candidate) | `CandidateRegisterForm` | Complete |
| `/register/verify-account` | Public (Email verification) | `VerifyAccountForm` | Complete |
| `/company-registration` | Public (Company onboarding) | `CompanyRegistrationForm` | Complete |
| `/company-registration/verify-company` | Public (Company OTP) | `CompanyVerifyForm` | Complete |
| `/assessment/invitation` | Public (Token verified) | `AssessmentInvitationView` | Complete |
| `/dashboard` | Authenticated (Any role) | Role Redirector | Complete |
| `/candidate` | Authenticated Candidate | Candidate Overview & Attempts | Complete |
| `/candidate/assessments` | Authenticated Candidate | `CandidateAssessmentWorkspace` | Partial (Direct `assessmentId` preview missing) |
| `/company-admin` | Company Admin / Owner | Company Dashboard Overview | Complete |
| `/company-admin/assessments` | Company Admin / Owner | `AssessmentManagement` | Complete |
| `/company-admin/assessments/report` | Company Admin / Owner / Evaluator | `DetailedAssessmentReportView` | Complete |
| `/company-admin/company-members` | Company Admin / Owner | `CompanyManageTeam` | Complete |
| `/company-admin/create-problems-bank` | Company Admin / Owner / Creator | `ProblemBankManagement` | Complete |
| `/company-admin/invitation` | Company Admin / Owner | Member Invitation Form | Complete |
| `/company-admin/report` | Company Admin / Owner | Organization Report View | Complete |
| `/assessment-creator` | Assessment Creator | Creator Overview | Complete |
| `/assessment-creator/assessments` | Assessment Creator | `AssessmentManagement` | Complete |
| `/assessment-creator/report` | Assessment Creator | Creator Attempt Reports | Complete |
| `/evaluator` | Evaluator | Evaluator Workspace & Queue | Complete |
| `/evaluator/assessments` | Evaluator | `AssessmentManagement` | Complete |
| `/evaluator/report` | Evaluator | Evaluator Report View | Complete |
| `/admin` | Platform Admin / Super Admin | Admin Control Center | Complete |
| `/admin/assessments` | Platform Admin / Super Admin | `AssessmentManagement` | Complete |
| `/admin/report` | Platform Admin / Super Admin | Global Telemetry & Reports | Complete |

---

## 3. Backend Modules & API Coverage Inventory

### Total Endpoints: 124 (12 Modules)

| Module | Total Endpoints | Implemented in Frontend | Pending / Remaining in Frontend |
| :--- | :---: | :---: | :---: |
| `00. Health Check & Root` | 1 | 0 | 1 |
| `01. Authentication & Session` | 12 | 5 | 7 |
| `02. Company & Workspace` | 9 | 7 | 2 |
| `03. Problem Bank Management` | 8 | 6 | 2 |
| `04. Assessment Lifecycle` | 36 | 32 | 4 |
| `05. Solution Submissions` | 8 | 0 | 8 |
| `06. Anti-Cheating Telemetry` | 8 | 0 | 8 |
| `07. Evaluation Engine` | 8 | 0 | 8 |
| `08. Score Calculation` | 10 | 0 | 10 |
| `09. Ranking & Results` | 7 | 0 | 7 |
| `10. Reports & Analytics` | 8 | 0 | 8 |
| `11. Admin Management` | 9 | 0 | 9 |

---

## 4. Feature Gap Analysis: Missing & Partial Features

### Part A: Partially Implemented Features
1. **Single Assessment Direct Route Resolution (`GET /assessment/:id`):**
   - API function `getSingleAssessmentDirectRoute` and hook `useGetSingleAssessmentDirectRoute` created.
   - UI dialog `SingleAssessmentDialog` supports view but is triggered solely via local table state in `getAllAssessment.tsx`.
   - Missing: Deep-link handling via URL parameter `?assessmentId=...` in `/company-admin/assessments`, `/candidate/assessments`, and role-based access gating when viewed directly by Candidate vs Company Staff vs Admin.
2. **Problem Bank Direct Management:**
   - Platform-wide problem bank retrieval (`GET /problem`) and alias (`GET /problem/my-company-problems`) not connected in filter dropdown.
3. **Assessment Problems Assignment Direct Route (`POST /assessment/:id/problems`):**
   - API function `addProblemsDirectRoute` and hook `useAddProblemsDirectRoute` created. Needs full integration inside `addProblemInAssesment.tsx`.

### Part B: Completely Missing Features (To be Implemented sequentially)
1. **Candidate Assessment Preview & Details Page:**
   - Candidate can take attempt if they have `attemptId`, but if they have `assessmentId` they cannot preview rules, duration, question count, and instructions before starting.
2. **Live Assessment Telemetry & Anti-Cheating Hook System (`Module 06`):**
   - Window blur / tab switch detector (`POST /anti-cheating/attempt/:attemptId/tab-switch`)
   - Fullscreen exit detector (`POST /anti-cheating/attempt/:attemptId/fullscreen-exit`)
   - Clipboard paste blocker & telemetry (`POST /anti-cheating/attempt/:attemptId/copy-paste`)
   - Real-time risk indicator for proctor view (`GET /anti-cheating/attempt/:attemptId/risk`)
3. **Evaluation Management Queue for Evaluator Persona (`Module 07`):**
   - Manual written grading form (`POST /evaluation/manual/:submissionId`)
   - Evaluator submission queue (`GET /evaluation`)
4. **Live Score Calculation & Breakdown View (`Module 08`):**
   - Public vs private test-case scoring breakdown (`GET /score-calculation/coding/:submissionId/score`)
   - Written grading rubric breakdown (`GET /score-calculation/written/:submissionId/score`)
5. **Leaderboard & Ranks Publishing (`Module 09`):**
   - Official results release trigger (`POST /ranking-result/publish/:assessmentId`)
   - Candidate career historical results view (`GET /ranking-result/my-results`)
6. **Admin User & Company Operations (`Module 11`):**
   - Platform user activation/deactivation (`PATCH /admin-management/users/:id/status`)
   - User deletion with conflict guard (`DELETE /admin-management/users/:id`)
   - System infrastructure metrics panel (`GET /admin-management/system-statistics`)

---

## 5. Priority-Based Implementation Plan

```text
Priority 1: Single Assessment Direct Route & Role-Based Preview UI
  ├── Wire `useGetSingleAssessmentDirectRoute` into URL parameter lookup (`?assessmentId=...`)
  ├── Role-based permission rendering (Candidate view vs Staff view vs Admin view)
  └── Complete loading, error, empty, and forbidden states

Priority 2: Assessment Problem Assignment Direct Route Integration
  ├── Wire `useAddProblemsDirectRoute` in `AddProblemInAssessment`
  └── Invalidate `["assessment-single"]` and `["company-assessments"]`

Priority 3: Anti-Cheating Telemetry Live Hooks in Candidate Workspace
  ├── Ingest tab switches, fullscreen departures, and copy-paste events
  └── Integrate risk warnings with attempt proctoring limits

Priority 4: Evaluator Manual Grading Queue & Form
  ├── Connect `POST /evaluation/manual/:submissionId`
  └── Build manual scoring modal with criteria rubric and feedback

Priority 5: Ranking & Leaderboard Publishing Workflow
  ├── Connect `POST /ranking-result/publish/:assessmentId`
  └── Candidate my-results portfolio page

Priority 6: Admin Management Directory Operations
  ├── User status toggle & user delete modal
  └── Platform system telemetry cards
```

---

## 6. Execution Log & Progress

- **[2026-10-07] Initialization & Audit:**
  - Full audit of 124 backend endpoints across 12 modules completed.
  - Full audit of 50 frontend API bindings and route structure completed.
  - Postman collections (`Developer_Assessment_Platform.postman_collection.json` and `Developer_Assessment_Platform_Auth.postman_collection.json`) regenerated with zero duplicates and strict Zod-compliant request payloads.
  - Backend route `/assessment/create-assessment` alias verified and compiled.
  - Frontend direct assessment API methods and pure hooks created in `src/api/assessment.api.ts` and `src/hook/assessment.hook.ts`.
  - Next.js static site export verified (`npm run build`: 29/29 static pages generated).

- **[2026-10-07] Feature 1: Single Assessment Direct Route & Role-Based UI (Status: COMPLETE):**
  - **API:** [getSingleAssessmentDirectRoute](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/assessment.api.ts) (`GET /assessment/:id`).
  - **Hook:** [useGetSingleAssessmentDirectRoute](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/assessment.hook.ts) pure query hook with `refetchInterval: false`.
  - **UI / Dialogs:** [SingleAssessmentDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/single-assessment-dialog.tsx) connected directly to `useGetSingleAssessmentDirectRoute`.
  - **Role-Based Permission Matrix:**
    - Platform Admin (`SUPER_ADMIN` / `ADMIN`): Full access to overview, problems with solutions, settings, roster telemetry, edit, delete, publish results.
    - Company Staff (`COMPANY_OWNER`, `COMPANY_ADMIN`, `ASSESSMENT_CREATOR`, `EVALUATOR`): Full workspace access to manage, monitor attempts, leaderboard, and edit.
    - Candidate (`CANDIDATE`): Sanitized problem bank preview (hides solutions, test cases, explanations), no staff management controls, direct "Take Assessment" CTA button.
  - **Deep-linking & Query Param Wiring:**
    - [GetAllAssessment](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/getAllAssessment.tsx) listens to `searchParams.get("assessmentId")` to open assessment dialog automatically.
    - [CandidateMyAttempts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-my-attempts.tsx) listens to `searchParams.get("assessmentId")` to preview assessment before attempt.
  - **Error & Forbidden States:** Enhanced 403 / Forbidden alert showing specific backend error messages and guidance for private invitations.
  - **Verification:** Frontend build clean (`npm run build`: 29/29 static pages, zero TypeScript errors). Backend build clean (`npm run build`: zero errors).
