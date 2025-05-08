// src/config/navigation.ts (update)
import { RoleEnum } from "@/services/api/types/role";

export interface NavigationItem {
  label: string; // i18n key for the navigation item label
  path: string; // Route path
  roles?: number[]; // Required roles for access (undefined means accessible to all)
  mobileOnly?: boolean; // Only show in mobile menu
  desktopOnly?: boolean; // Only show in desktop menu
  children?: NavigationItem[]; // Submenu items
}

export const createNavigationConfig = (): NavigationItem[] => [
  {
    label: "common:navigation.home",
    path: "/",
  },
  {
    label: "common:navigation.tickets",
    path: "/tickets",
  },
  {
    label: "common:navigation.users",
    path: "/admin-panel/users",
    roles: [RoleEnum.ADMIN],
  },
  {
    label: "common:navigation.queues",
    path: "/admin-panel/queues",
    roles: [RoleEnum.ADMIN],
  },
  {
    label: "common:navigation.notifications",
    path: "/admin-panel/notifications",
    roles: [RoleEnum.ADMIN],
  },
];

// Return navigation config with authentication items
export const getNavigationConfig = () => createNavigationConfig();
