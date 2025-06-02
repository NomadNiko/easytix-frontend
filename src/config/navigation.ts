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
  // Show individual my-tickets link for all authenticated users
  {
    label: "common:navigation.myTickets",
    path: "/my-tickets",
    requiresAuth: true,
    // No role restriction - all authenticated users can see their own tickets
  },
  // Tickets dropdown for admin/service desk
  {
    label: "common:navigation.tickets",
    path: "#",
    requiresAuth: true,
    roles: [RoleEnum.ADMIN, RoleEnum.SERVICE_DESK],
    children: [
      {
        label: "common:navigation.search",
        path: "/tickets",
        requiresAuth: true,
        roles: [RoleEnum.ADMIN, RoleEnum.SERVICE_DESK],
      },
      {
        label: "common:navigation.timeline",
        path: "/timeline",
        requiresAuth: true,
        roles: [RoleEnum.ADMIN, RoleEnum.SERVICE_DESK],
      },
      {
        label: "common:navigation.board",
        path: "/board",
        requiresAuth: true,
        roles: [RoleEnum.ADMIN, RoleEnum.SERVICE_DESK],
      },
    ],
  },
  // Admin dropdown for admin only
  {
    label: "common:navigation.admin",
    path: "#",
    requiresAuth: true,
    roles: [RoleEnum.ADMIN],
    children: [
      {
        label: "common:navigation.queues",
        path: "/admin-panel/queues",
        roles: [RoleEnum.ADMIN],
      },
      {
        label: "common:navigation.users",
        path: "/admin-panel/users",
        roles: [RoleEnum.ADMIN],
      },
      {
        label: "common:navigation.systemDefaults",
        path: "/admin-panel/system-defaults",
        roles: [RoleEnum.ADMIN],
      },
    ],
  },
  // Show submit ticket for non-authenticated users
  {
    label: "common:navigation.submit_ticket",
    path: "/submit-ticket",
    requiresGuest: true,
  },
];

// Return navigation config with authentication items
export const getNavigationConfig = () => createNavigationConfig();
