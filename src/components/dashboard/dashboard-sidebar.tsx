"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Code2 } from "lucide-react";
import { DashboardRole, SidebarItems, UserRole } from "@/types";
import {
  adminRoutes,
  candidateRoutes,
  companyAdminRoutes,
  assessmentCreatorRoutes,
  evaluatorRoutes,
} from "@/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetMe } from "@/hook";
import { getUserEffectiveRole } from "@/utils";

const sidebarRoutes: Partial<Record<DashboardRole, SidebarItems>> = {
  SUPER_ADMIN: adminRoutes,
  ADMIN: adminRoutes,
  CANDIDATE: candidateRoutes,
  COMPANY_OWNER: companyAdminRoutes,
  COMPANY_ADMIN: companyAdminRoutes,
  ASSESSMENT_CREATOR: assessmentCreatorRoutes,
  EVALUATOR: evaluatorRoutes,
};

export function DashboardSidebar({ role }: { role?: DashboardRole }) {
  const pathname = usePathname();
  const { data } = useGetMe();
  const user = data?.data;

  const effectiveRole: DashboardRole =
    role || (user ? getUserEffectiveRole(user) : UserRole.CANDIDATE);
  const routes: SidebarItems = sidebarRoutes[effectiveRole] || [];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Code2 className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight tracking-tight">
              DevAssess
            </span>
            <span className="text-[10px] font-medium leading-none text-muted-foreground">
              Coding Assessment Platform
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {routes.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      render={<Link href={subItem.url} />}
                      isActive={pathname === subItem.url}
                    >
                      {subItem.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}