import { SidebarItems } from "@/types";

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
        title: "Invitations",
        url: "/candidate/invitations",
      },
      {
        title: "Assessments",
        url: "/candidate/assessments",
      },
      {
        title: "Results",
        url: "/candidate/results",
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
        title: "Assessments",
        url: "/company-admin/assessments",
      },
      {
        title: "Candidates",
        url: "/company-admin/candidates",
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
        title: "Submissions",
        url: "/evaluator/submissions",
      },
    ],
  },
];
