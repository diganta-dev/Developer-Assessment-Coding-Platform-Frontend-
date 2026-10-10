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
| `/candidate/assessments` | Authenticated Candidate | `CandidateAssessmentWorkspace` | Complete |
| `/candidate/results` | Authenticated Candidate | `CandidateMyResults` | Complete |
| `/candidate/submissions` | Authenticated Candidate | `CandidateMySubmissions` | Complete |
| `/company-admin` | Company Admin / Owner | Company Dashboard Overview | Complete |
| `/company-admin/assessments` | Company Admin / Owner | `AssessmentManagement` | Complete |
| `/company-admin/assessments/report` | Company Admin / Owner / Evaluator | `DetailedAssessmentReportView` | Complete |
| `/company-admin/company-members` | Company Admin / Owner | `CompanyManageTeam` | Complete |
| `/company-admin/create-problems-bank` | Company Admin / Owner / Creator | `ProblemBankManagement` | Complete |
| `/company-admin/invitation` | Company Admin / Owner | Member Invitation Form | Complete |
| `/company-admin/candidates` | Company Admin / Owner | `CompanyCandidatesView` | Complete |
| `/company-admin/report` | Company Admin / Owner | `ReportsHub` (Analytics & Organization Pipeline) | Complete |
| `/assessment-creator` | Assessment Creator | Creator Overview | Complete |
| `/assessment-creator/assessments` | Assessment Creator | `AssessmentManagement` | Complete |
| `/assessment-creator/problems` | Assessment Creator | `ProblemBankCreate` | Complete |
| `/assessment-creator/report` | Assessment Creator | `ReportsHub` (Analytics & Attempt Reports) | Complete |
| `/evaluator` | Evaluator | Evaluator Workspace & Queue | Complete |
| `/evaluator/assessments` | Evaluator | `AssessmentManagement` | Complete |
| `/evaluator/submissions` | Evaluator | `EvaluatorGradingQueue` | Complete |
| `/evaluator/report` | Evaluator | `ReportsHub` (Analytics & Attempt Reports) | Complete |
| `/admin` | Platform Admin / Super Admin | Admin Control Center (`AdminOverview`) | Complete |
| `/admin/users` | Platform Admin / Super Admin | `AdminUserManagement` Directory | Complete |
| `/admin/companies` | Platform Admin / Super Admin | `AdminCompanyManagement` Directory | Complete |
| `/admin/assessments` | Platform Admin / Super Admin | `AssessmentManagement` | Complete |
| `/admin/report` | Platform Admin / Super Admin | `ReportsHub` (Global Analytics & Reports) | Complete |
| `/candidate/invitations` | Authenticated Candidate | `CandidateMyAttempts` | Complete |
| `/candidate/profile` | Authenticated Candidate | `CandidateProfileView` | Complete |

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
| `05. Solution Submissions` | 8 | 8 | 0 |
| `06. Anti-Cheating Telemetry` | 8 | 8 | 0 |
| `07. Evaluation Engine` | 8 | 8 | 0 |
| `08. Score Calculation` | 10 | 10 | 0 |
| `09. Ranking & Results` | 7 | 7 | 0 |
| `10. Reports & Analytics` | 8 | 8 | 0 |
| `11. Admin Management` | 9 | 9 | 0 |

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

- **[2026-10-07] Feature 2: Assessment Problem Assignment Direct Route Integration (Status: COMPLETE):**
  - **API:** [addProblemsDirectRoute](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/assessment.api.ts) (`POST /assessment/:id/problems`).
  - **Hook:** [useAddProblemsDirectRoute](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/assessment.hook.ts) pure mutation hook.
  - **UI / Component:** [AddProblemInAssessment](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/addProblemInAssesment.tsx) wired to `useAddProblemsDirectRoute(selectedAssessmentId)`.
  - **Cache Management:** Invalidation of `["company-assessments"]`, `["assessments"]`, `["company-questions"]`, `["assessment-single", selectedAssessmentId]`, and `["assessment-single-direct", selectedAssessmentId]` on mutation success.
  - **Verification:** Frontend build clean (`npm run build`: 29/29 static pages).

- **[2026-10-07] Feature 3: Anti-Cheating Telemetry Live Hooks & Proctor Risk Audit (Module 06) (Status: COMPLETE):**
  - **API:** [anti-cheating.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/anti-cheating.api.ts):
    - `recordAntiCheatViolation` (`POST /anti-cheating/attempt/:attemptId/violation`)
    - `detectTabSwitch` (`POST /anti-cheating/attempt/:attemptId/tab-switch`)
    - `detectMultipleTabs` (`POST /anti-cheating/attempt/:attemptId/multiple-tabs`)
    - `detectCopyPaste` (`POST /anti-cheating/attempt/:attemptId/copy-paste`)
    - `detectFullscreenExit` (`POST /anti-cheating/attempt/:attemptId/fullscreen-exit`)
    - `detectSuspiciousActivity` (`POST /anti-cheating/attempt/:attemptId/suspicious-activity`)
    - `getCheatingRisk` (`GET /anti-cheating/attempt/:attemptId/risk`)
    - `flagAttempt` (`POST /anti-cheating/attempt/:attemptId/flag`)
  - **Hooks:** [anti-cheating.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/anti-cheating.hook.ts) pure TanStack Query hooks.
  - **Candidate Workspace Telemetry:** [CandidateAssessmentWorkspace](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-assessment-workspace.tsx):
    - Live tab switch detection via `document.visibilitychange` with duration calculation and proctor notification.
    - Mandatory fullscreen departure detection via `document.fullscreenchange` with persistent alert modal & re-entry CTA.
    - Clipboard copy & paste blocking and telemetry via `copy`/`paste` event interceptors when `preventCopyPaste` policy is active.
    - Multi-tab concurrent exam session detection via `BroadcastChannel` heartbeat.
    - Real-time telemetry status banner with live anti-cheat guard indicators.
  - **Staff / Evaluator Audit Dialog:** [CheatingRiskAuditDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/cheating-risk-dialog.tsx) connected in [DetailedAssessmentReportView](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/detailed-assessment-report-view.tsx) allowing Company Staff/Admins/Evaluators to review multi-factor risk scores, breakdown metrics, timeline, and formally flag or disqualify candidate attempts.
  - **Verification:** Frontend build clean (`npm run build`: 29/29 static pages, zero TypeScript errors).

- **[2026-10-07] Feature 4: Evaluator Manual Grading Queue & Form (Module 07) (Status: COMPLETE):**
  - **API:** [evaluation.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/evaluation.api.ts):
    - `getAllEvaluations` (`GET /evaluation`)
    - `getEvaluationById` (`GET /evaluation/:id`)
    - `manualEvaluateSubmission` (`POST /evaluation/manual/:submissionId`)
    - `evaluateCodingSubmission` (`POST /evaluation/coding/:submissionId`)
    - `evaluateMCQSubmission` (`POST /evaluation/mcq/:submissionId`)
    - `evaluateWrittenSubmission` (`POST /evaluation/written/:submissionId`)
    - `calculateAttemptEvaluationScore` (`POST /evaluation/attempt/:attemptId/score`)
  - **Hooks:** [evaluation.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/evaluation.hook.ts) pure TanStack Query hooks.
  - **UI / Components:**
    - [ManualEvaluationDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/evaluator/manual-evaluation-dialog.tsx): Rubric-based manual grading form with max points guard (`0 <= marks <= maxMarks`), feedback tags, candidate code/text preview, and cache invalidation.
    - [EvaluatorGradingQueue](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/evaluator/evaluator-grading-queue.tsx): Full grading workspace with summary telemetry, filters by status and type, search, manual grading modals, and Judge0/MCQ auto-trigger actions.
    - Embedded into `/evaluator` dashboard and created static-compatible Server Component route `/evaluator/submissions` ([page.tsx](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/evaluator/submissions/page.tsx)) wrapped in `<Suspense>`.
- **[2026-10-07] Feature 5: Ranking & Leaderboard Publishing Workflow (Module 09) (Status: COMPLETE):**
  - **API:** [ranking.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/ranking.api.ts):
    - `generateAssessmentResult` (`POST /ranking-result/generate/:attemptId`)
    - `calculateCandidateRank` (`GET /ranking-result/rank/:attemptId`)
    - `getAssessmentLeaderboard` (`GET /ranking-result/leaderboard/:assessmentId`)
    - `publishAssessmentResult` (`POST /ranking-result/publish/:assessmentId`)
    - `getMyAssessmentResults` (`GET /ranking-result/my-results`)
    - `getCandidateAttemptResult` (`GET /ranking-result/attempt/:attemptId`)
  - **Hooks:** [ranking.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/ranking.hook.ts) pure TanStack Query hooks.
  - **UI / Components:**
    - [CandidateMyResults](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-my-results.tsx): Candidate portfolio of verified assessment results, overall score gauge, pass/fail status badges, competitive rank (`Rank #X / Y`), percentile score, and modal for question-by-question scorecard breakdown.
    - Connected in `/candidate` overview and added static-compatible Server Component route `/candidate/results` ([page.tsx](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/candidate/results/page.tsx)) wrapped in `<Suspense>`.
- **[2026-10-07] Feature 6: Admin Management Directory Operations (Module 11) (Status: COMPLETE):**
  - **API:** [admin.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/admin.api.ts):
    - `getAdminDashboardStatistics` (`GET /admin-management/dashboard-statistics`)
    - `getAdminSystemStatistics` (`GET /admin-management/system-statistics`)
    - `getAdminUsers` (`GET /admin-management/users`)
    - `getAdminUserDetails` (`GET /admin-management/users/:id`)
    - `updateAdminUserStatus` (`PATCH /admin-management/users/:id/status`)
    - `deleteAdminUser` (`DELETE /admin-management/users/:id`)
    - `getAdminCompanies` (`GET /admin-management/companies`)
  - **Hooks:** [admin.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/admin.hook.ts) pure TanStack Query hooks.
  - **UI / Components:**
    - [AdminOverview](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/admin/admin-overview.tsx): Live platform statistics and infrastructure telemetry (Server uptime, Node version, memory heap, entity counts, security incident metrics).
    - [AdminUserManagement](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/admin/admin-user-management.tsx): Global user management directory with search, role filters, status toggles (activate/deactivate), delete confirmation dialog, and pagination.
    - Embedded into `/admin` dashboard and added static-compatible Server Component route `/admin/users` ([page.tsx](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/admin/users/page.tsx)) wrapped in `<Suspense>`.
  - **Verification:** Frontend build clean (`npm run build`: 32/32 static pages, zero TypeScript errors).

- **[2026-10-07] Feature 7: Score Calculation Endpoints Integration (Module 08) (Status: COMPLETE):**
  - **API:** [score-calculation.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/score-calculation.api.ts):
    - `getSubmissionScore` (`GET /score-calculation/submission/:submissionId`)
    - `getCodingScoreBreakdown` (`GET /score-calculation/coding/:submissionId/score`)
    - `getMCQScoreBreakdown` (`GET /score-calculation/mcq/:submissionId/score`)
    - `getWrittenScoreBreakdown` (`GET /score-calculation/written/:submissionId/score`)
    - `getAttemptScore` (`GET /score-calculation/attempt/:attemptId`)
    - `recalculateAttemptScore` (`POST /score-calculation/attempt/:attemptId`)
  - **Hooks:** [score-calculation.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/score-calculation.hook.ts) pure TanStack Query hooks.
  - **UI / Components:**
    - [SubmissionScoreBreakdownCard](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/submission-score-breakdown-card.tsx): Granular submission diagnostics (public vs hidden test cases, memory MB, execution time ms, MCQ option comparison, written word limit alerts, examiner feedback).
    - Integrated into [AttemptResultDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/attempt-result-dialog.tsx) and [CalculateScoreDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/calculate-score-dialog.tsx).
  - **Verification:** Frontend build clean (`npm run build`: 33/33 static pages, zero TypeScript errors).

- **[2026-10-07] Feature 8: Solution Submissions Monitoring Integration (Module 05) (Status: COMPLETE):**
  - **API:** [submission.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/submission.api.ts):
    - `createSubmission` (`POST /submission`)
    - `createSubmissionByAttempt` (`POST /submission/attempts/:attemptId`)
    - `submitSubmission` (`POST /submission/submit`)
    - `submitSubmissionById` (`POST /submission/:id/submit`)
    - `evaluateCodingSubmissionDirect` (`POST /submission/:id/evaluate`)
    - `getMySubmissions` (`GET /submission/my-submissions`)
    - `getAttemptSubmissions` (`GET /submission/attempts/:attemptId`)
    - `getSubmissionById` (`GET /submission/:id`)
  - **Hooks:** [submission.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/submission.hook.ts) pure TanStack Query hooks.
  - **UI / Pages:**
    - [CandidateMySubmissions](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-my-submissions.tsx): Dedicated solution submissions browser with status tabs, accuracy filters, search, full source code viewer, and score engine breakdown modal.
    - Static-compatible Server Component route `/candidate/submissions` ([page.tsx](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/candidate/submissions/page.tsx)) wrapped in `<Suspense>`.
    - Added to `candidateRoutes` sidebar navigation.
  - **Verification:** Frontend build clean (`npm run build`: 33/33 static pages).

- **[2026-10-07] Feature 9: Reports & Analytics Deep Integration (Module 10) (Status: COMPLETE):**
  - **API:** [reports-analytics.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/reports-analytics.api.ts):
    - `getAssessmentReport` (`GET /reports-analytics/assessment/:assessmentId/report`)
    - `getScoreDistribution` (`GET /reports-analytics/assessment/:assessmentId/score-distribution`)
    - `getPassFailStatistics` (`GET /reports-analytics/assessment/:assessmentId/pass-fail`)
    - `getAssessmentStatistics` (`GET /reports-analytics/assessment/:assessmentId/statistics`)
    - `getCandidatePerformance` (`GET /reports-analytics/attempt/:attemptId/performance`)
    - `getCandidateReport` (`GET /reports-analytics/candidate/:candidateId/report`)
    - `getCompanyReport` (`GET /reports-analytics/company/:companyId/report`)
  - **Hooks:** [reports-analytics.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/reports-analytics.hook.ts) pure TanStack Query hooks.
  - **UI / Components:**
    - [AssessmentAnalyticsView](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/reports/assessment-analytics-view.tsx): Cohort funnel (invited, started, completed), outcome pass rates, near-miss diagnostic alerts, score variance distribution, problem difficulty & accuracy matrix, and proctor infraction summaries.
    - [CompanyAnalyticsView](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/reports/company-analytics-view.tsx): Executive talent pipeline funnel, hiring conversion rates, drop-off diagnostics, and multi-assessment roster metrics.
    - [CandidateCareerReportView](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/reports/candidate-career-report-view.tsx): Multi-assessment talent portfolio, skill category mastery gauges, and historical rank benchmarks.
    - [ReportsHub](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/reports/reports-hub.tsx): Tabbed hub wired into `/company-admin/report`, `/admin/report`, `/evaluator/report`, and `/assessment-creator/report`.
  - **Verification:** Next.js static export build clean (`npm run build`: 33/33 static pages generated).

- **[2026-10-07] Feature 10: Auth Lifecycle & Problem Bank Scope Integration (Module 01, 03) (Status: COMPLETE):**
  - **API:** [auth.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/auth.api.ts) & [question.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/question.api.ts):
    - `forgotPassword` (`POST /auth/forgot-password`)
    - `resetPassword` (`POST /auth/reset-password`)
    - `verifyLoginOtp` (`POST /auth/verify-login-otp`)
    - `resendLoginOtp` (`POST /auth/resend-login-otp`)
    - `googleLogin` (`POST /auth/google`)
    - `refreshToken` (`POST /auth/refresh-token`)
    - `getProblemsDirect` (`GET /problem`)
    - `getMyCompanyProblems` (`GET /problem/my-company-problems`)
  - **Hooks:** [auth.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/auth.hook.ts) & [question.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/question.hook.ts) pure TanStack Query hooks.
  - **UI / Components:**
    - [ForgotPasswordDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/form/forgot-password-dialog.tsx) connected directly into [LoginForm](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/form/login-from.tsx).
    - Scope toggle filter ("My Company" vs "Platform Bank") integrated into [getallproblem-table.tsx](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/Problem-Bank-Management/getallproblem-table.tsx).
  - **Verification:** Next.js static export build clean (`npm run build`: 33/33 static pages generated).

- **[2026-10-07] Feature 11: Company Settings & Profile Edit View (Module 02) (Status: COMPLETE):**
  - **API:** [company.api.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/api/company.api.ts):
    - `updateCompany` (`PATCH /company/update-company/:companyId`)
  - **Hooks:** [company.hook.ts](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/hook/company.hook.ts) pure TanStack Query mutation hook `useUpdateCompany`.
  - **UI / Components:**
    - [EditCompanyDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/company-dashboard/edit-company-dialog.tsx): Full company settings modal with real-time logo image preview, name validation, website and multi-line mission description inputs, loading state, error alert, and cache invalidation of `["user-company"]`.
    - Wired into [CompanyProfile](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/company-dashboard/company-profile.tsx) header actions ("Edit Profile" button) and empty description card CTA.
  - **Verification:**
    - `npm run build`: 33/33 static pages generated, zero TypeScript errors.
    - Biome linting: 0 errors, 0 warnings.

- **[2026-10-07] Feature 12: Candidates Roster & Navigation Route Synchronization (Status: COMPLETE):**
  - **Resolution for 404 on `/company-admin/candidates`:**
    - Created [CompanyCandidatesPage](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/company-admin/candidates/page.tsx) Server Component with static metadata, `<Suspense>`, and back navigation.
    - Built [CompanyCandidatesView](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/company-dashboard/company-candidates-view.tsx) client component:
      - Assessment selector toolbar & quick refresh button.
      - KPI summary metrics: Total Candidates, Completed Tests, Pass Rate %, Average Score %.
      - Real-time search across candidate names and emails.
      - Dual filter dropdowns (by attempt status and pass/fail evaluation outcome).
      - Candidates table with avatars, session duration, status badges, scores, progress bar, and pass/fail tags.
      - Integrated actions: "Invite Candidate" ([InviteCandidateDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/invite-candidate-dialog.tsx)), "Scorecard Breakdown" ([AttemptResultDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/attempt-result-dialog.tsx)), "Submissions & Details" ([AttemptDetailsDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/attempt-details-dialog.tsx)), and "Proctor Telemetry Audit" ([CheatingRiskAuditDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/cheating-risk-dialog.tsx)).
  - **Additional Navigation Route Alignment:**
    - Created [AdminCompaniesPage](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/admin/companies/page.tsx) and [AdminCompanyManagement](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/admin/admin-company-management.tsx) for `/admin/companies`.
    - Created [AssessmentCreatorProblemsPage](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/assessment-creator/problems/page.tsx) for `/assessment-creator/problems`.
    - Created [CandidateInvitationsPage](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/candidate/invitations/page.tsx) for `/candidate/invitations`.
    - Created [CandidateProfilePage](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/candidate/profile/page.tsx) and [CandidateProfileView](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-profile-view.tsx) for `/candidate/profile`.
  - **Verification:**
    - Next.js static site export clean (`npm run build`: 38/38 static pages generated, zero TypeScript errors).
    - Biome checks clean (0 errors, 0 warnings).

---

# 7. Final Comprehensive Audit & Verification Summary

| Module | Endpoints | Frontend API | TanStack Query Hook | Primary UI Consumer | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **01. Authentication & Session** | 12 | `auth.api.ts` | `auth.hook.ts` | `LoginForm`, `RegisterForm`, `ForgotPasswordDialog`, `VerifyAccountForm`, `UserMenu` | **COMPLETE** |
| **02. Company & Workspace** | 9 | `company.api.ts` | `company.hook.ts` | `CompanyProfile`, `EditCompanyDialog`, `CompanyManageTeam`, `MemberInvite` | **COMPLETE** |
| **03. Problem Bank Management** | 8 | `question.api.ts` | `question.hook.ts` | `GetAllProblemTable`, `CreateCodingProblem`, `CreateMCQQuestion`, `CreateWrittenQuestion`, `EditProblemDialog` | **COMPLETE** |
| **04. Assessment Lifecycle** | 36 | `assessment.api.ts` | `assessment.hook.ts` | `GetAllAssessment`, `SingleAssessmentDialog`, `CreateAssessment`, `EditAssessmentDialog`, `AddProblemInAssessment`, `AssessmentInvitationView`, `CandidateAssessmentWorkspace` | **COMPLETE** |
| **05. Solution Submissions** | 8 | `submission.api.ts` | `submission.hook.ts` | `CandidateMySubmissions`, `CreateSubmissionDialog`, `CandidateAssessmentWorkspace` | **COMPLETE** |
| **06. Anti-Cheating Telemetry** | 8 | `anti-cheating.api.ts` | `anti-cheating.hook.ts` | `CandidateAssessmentWorkspace`, `CheatingRiskAuditDialog`, `DetailedAssessmentReportView` | **COMPLETE** |
| **07. Evaluation Engine** | 8 | `evaluation.api.ts` | `evaluation.hook.ts` | `EvaluatorGradingQueue`, `ManualEvaluationDialog` | **COMPLETE** |
| **08. Score Calculation** | 10 | `score-calculation.api.ts` | `score-calculation.hook.ts` | `SubmissionScoreBreakdownCard`, `AttemptResultDialog`, `CalculateScoreDialog` | **COMPLETE** |
| **09. Ranking & Results** | 7 | `ranking.api.ts` | `ranking.hook.ts` | `CandidateMyResults`, `AssessmentLeaderboardDialog`, `PublishResultsDialog`, `AssessmentResultsDialog` | **COMPLETE** |
| **10. Reports & Analytics** | 8 | `reports-analytics.api.ts` | `reports-analytics.hook.ts` | `ReportsHub`, `AssessmentAnalyticsView`, `CompanyAnalyticsView`, `CandidateCareerReportView` | **COMPLETE** |
| **11. Admin Management** | 9 | `admin.api.ts` | `admin.hook.ts` | `AdminOverview`, `AdminUserManagement` | **COMPLETE** |

- **[2026-10-08] Candidate Assessment Workspace Freeze Fix (Status: RESOLVED):**
  - **Root Cause Analysis:** Diagnosed high-CPU tab lockup using Chrome DevTools Protocol (`Debugger.pause`). Discovered mutual recursive JSX instantiation between [AttemptResultDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/attempt-result-dialog.tsx) and [CalculateScoreDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/calculate-score-dialog.tsx). Both dialogs unconditionally rendered each other as child elements, causing an infinite React Fiber component instantiation cycle whenever either dialog mounted.
  - **Resolution:**
    - Guarded child `<CalculateScoreDialog>` in [AttemptResultDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/attempt-result-dialog.tsx) with `!isCandidateView && calculateScoreOpen && Boolean(attemptId)`.
    - Guarded child `<AttemptResultDialog>` in [CalculateScoreDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/calculate-score-dialog.tsx) with `resultDialogOpen && Boolean(attemptId)`.
    - Guarded sub-dialog renders in [CandidateAssessmentWorkspace](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-assessment-workspace.tsx), [AssessmentResultsDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/assessment-results-dialog.tsx), [AssessmentAttemptsDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/assessment-attempts-dialog.tsx), and [AssessmentLeaderboardDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/assessment-leaderboard-dialog.tsx).
    - Fixed typo `"useclient";` to `"use client";` in [FinalizeSubmitAttemptDialog](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/assessments-components/finalize-submit-attempt-dialog.tsx).
  - **Verification:** Verified in headless Chrome via CDP: the candidate assessment workspace at `/candidate/assessments?assessmentId=cmuwbqtcx00009i2tpx1klh1t&attemptId=cmuznom8l0005y62tkdtbi6tt` now loads in milliseconds, displaying the live assessment problem statement, test cases, and code editor with 0% CPU consumption. Production export verified (`npm run build`: 38/38 pages generated, 0 TypeScript errors).

- **[2026-10-09] Feature 13: Dedicated Fullscreen Examination Experience & Layout Isolation (Status: COMPLETE):**
  - **Root Cause Analysis:** The assessment examination at `/candidate/assessments` was nested under `src/app/(dashboard)/candidate/layout.tsx`, which unconditionally wrapped all candidate routes in `<DashboardShell role={UserRole.CANDIDATE}>`, causing the examination workspace to inherit the dashboard sidebar, navbar, header, and container padding.
  - **Architecture & Layout Separation:**
    - Refactored `src/app/(dashboard)/candidate`:
      - Moved candidate dashboard views (`/candidate`, `/candidate/invitations`, `/candidate/profile`, `/candidate/results`, `/candidate/submissions`) into a Next.js Route Group: `src/app/(dashboard)/candidate/(candidate-dashboard)`.
      - Moved `DashboardShell` into `(candidate-dashboard)/layout.tsx`, ensuring dashboard chrome is only rendered for standard candidate dashboard pages.
      - Streamlined `src/app/(dashboard)/candidate/layout.tsx` to provide only `<RoleGuard roles={[UserRole.CANDIDATE]}>`, protecting all candidate routes while leaving layout styling unconstrained.
      - Created dedicated examination layout [AssessmentExaminationLayout](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/app/(dashboard)/candidate/assessments/layout.tsx) (`fixed inset-0 h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col z-50`) providing a 100% distraction-free, full-window canvas.
  - **Dedicated Examination Workspace UI:**
    - Built [CandidateExaminationArena](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-examination-arena.tsx):
      - **Top Bar:** Assessment title, attempt number badge, authoritative countdown timer, live proctor guard telemetry badge, autosave indicator, fullscreen toggle, and Finalize & Submit CTA button.
      - **Question Navigator:** Horizontal strip of question chips with status badges (answered green check, flagged amber flag, active outline), and progress statistics counter.
      - **Split View Arena:** Left panel for problem description, marks, difficulty, and public test cases; Right panel dynamic solver (accessible MCQ option cards, written response with word counter and limits, coding IDE with language switcher, boilerplate reset, and tab-indentation support).
      - **Anti-Cheat Telemetry Live Hooks:** Integrated tab switch detection, copy-paste blocking, fullscreen exit tracking, and multi-tab session prevention.
      - **Fullscreen Behavior:** Pre-flight modal, exit warning modal with re-entry CTA, and throttled proctor telemetry reporting.
      - **Authoritative Server Countdown Timer:** Synchronized with server `attempt.expiresAt`, visual color-coding (normal, warning <= 10m, critical <= 3m), and auto-submission on expiry.
      - **Final Submission Modal:** Progress statistics breakdown (answered, unanswered with zero-mark warnings, flagged), submission loading state, error preservation, and redirect to `/candidate/results` upon confirmation.
      - **State & Error Recovery:** Dedicated screens for missing parameters (`MissingAttemptSessionView`), already-submitted attempts (`AttemptCompletedView`), expired sessions (`AttemptExpiredView`), and network errors.
  - **Route & Navigation Alignment:**
    - Updated candidate sidebar routes in `src/routes/index.ts` to point "My Tests & Invitations" directly to `/candidate/invitations`.
    - Aligned CTA links in [CandidateOverview](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-overview.tsx), [CandidateMyResults](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-my-results.tsx), and [CandidateProfileView](file:///home/diganta/Programming/B7A7/developer-assessment-coding-platform-frontend/src/components/dashboard/candidate-dashboard/candidate-profile-view.tsx).
  - **Verification:**
    - Next.js static site export (`npm run build`): 38/38 static pages generated cleanly with 0 errors.
    - Biome linting: 0 errors, 0 warnings across all examination layouts and components.
    - All candidate route HTTP endpoints (`/candidate`, `/candidate/invitations`, `/candidate/profile`, `/candidate/results`, `/candidate/submissions`, `/candidate/assessments`) verified returning HTTP 200.

