// src/config/navigation.ts (update)
import { RoleEnum } from "@/services/api/types/role";

export interface NavigationItem {
  label: string; // i18n key for the navigation item label
  path: string; // Route path
  roles?: number[]; // Required roles for access (undefined means accessible to all)
  mobileOnly?: boolean; // Only show in mobile menu
  desktopOnly?: boolean; // Only show in desktop menu
  children?: NavigationItem[]; // Submenu items
  requiresAuth?: boolean; // Requires authentication
  requiresGuest?: boolean; // Only show to non-authenticated users
}

export const createNavigationConfig = (): NavigationItem[] => [
  {
    label: "common:navigation.home",
    path: "/",
  },
  // Show tickets pages - all authenticated users can access my-tickets
  {
    label: "common:navigation.myTickets",
    path: "/my-tickets",
    requiresAuth: true,
    // No role restriction - all authenticated users can see their own tickets
  },
  {
    label: "common:navigation.tickets",
    path: "/tickets",
    requiresAuth: true,
    roles: [RoleEnum.ADMIN, RoleEnum.SERVICE_DESK], // Only for admin (role=1) and service desk (role=2)
  },
  // Show submit ticket for non-authenticated users
  {
    label: "common:navigation.submit_ticket",
    path: "/submit-ticket",
    requiresGuest: true,
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
  {
    label: "common:navigation.systemDefaults",
    path: "/admin-panel/system-defaults",
    roles: [RoleEnum.ADMIN],
  },
];

// Return navigation config with authentication items
export const getNavigationConfig = () => createNavigationConfig();
