import type { SidebarItems } from "@/types";

export const adminRoutes: SidebarItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        url: "/admin/users",
      },
      {
        title: "Companies",
        url: "/admin/companies",
      },
      {
        title: "Assessments",
        url: "/admin/assessments",
      },
      {
        title: "Reports",
        url: "/admin/report",
      },
    ],
  },
];

export const candidateRoutes: SidebarItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/candidate",
      },
    ],
  },
  {
    title: "Assessments",
    items: [
      {
        title: "My Tests & Invitations",
        url: "/candidate/invitations",
      },
      {
        title: "Results",
        url: "/candidate/results",
      },
      {
        title: "Submissions",
        url: "/candidate/submissions",
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        title: "Register Company",
        url: "/company-registration",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/candidate/profile",
      },
    ],
  },
];

export const companyAdminRoutes: SidebarItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/company-admin",
      },
    ],
  },
  {
    title: "Company Management",
    items: [
      {
        title: "Members",
        url: "/company-admin/company-members",
      },
      {
        title: "Invite Members",
        url: "/company-admin/invitation",
      },
      {
        title: "Problems Bank Management",
        url: "/company-admin/create-problems-bank",
      },
      {
        title: "Assessments",
        url: "/company-admin/assessments",
      },
      {
        title: "Candidates",
        url: "/company-admin/candidates",
      },
      {
        title: "Reports",
        url: "/company-admin/report",
      },
    ],
  },
];

export const assessmentCreatorRoutes: SidebarItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/assessment-creator",
      },
    ],
  },
  {
    title: "Assessment Builder",
    items: [
      {
        title: "Assessments",
        url: "/assessment-creator/assessments",
      },
      {
        title: "Problem Bank",
        url: "/assessment-creator/problems",
      },
      {
        title: "Reports",
        url: "/assessment-creator/report",
      },
    ],
  },
];

export const evaluatorRoutes: SidebarItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/evaluator",
      },
    ],
  },
  {
    title: "Evaluations",
    items: [
      {
        title: "Assessments",
        url: "/evaluator/assessments",
      },
      {
        title: "Submissions",
        url: "/evaluator/submissions",
      },
      {
        title: "Reports",
        url: "/evaluator/report",
      },
    ],
  },
];
