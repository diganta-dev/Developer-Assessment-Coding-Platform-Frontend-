import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export interface SidebarGroupItem {
  title: string;
  items: NavItem[];
}

export type SidebarItems = SidebarGroupItem[];
