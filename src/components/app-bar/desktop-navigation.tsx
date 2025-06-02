"use client";
import { useTranslation } from "@/services/i18n/client";
import { Group, Menu, Button } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import Link from "@/components/link";
import { getNavigationConfig, NavigationItem } from "@/config/navigation";
import useAuth from "@/services/auth/use-auth";

interface DesktopNavigationProps {
  onCloseMenu?: () => void;
}

const DesktopNavigation = ({ onCloseMenu }: DesktopNavigationProps) => {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const navItems = getNavigationConfig();

  // Check if the user has the required role to view the nav item
  const hasRequiredRole = (roles?: number[]): boolean => {
    if (!roles || roles.length === 0) return true;
    if (!user?.role?.id) return false;
    return roles.map(String).includes(String(user.role.id));
  };

  // Check if the nav item should be shown based on authentication status
  const shouldShowItem = (item: NavigationItem): boolean => {
    // Check role requirements
    if (!hasRequiredRole(item.roles)) return false;

    // Check authentication requirements
    if (item.requiresAuth && !user) return false;
    if (item.requiresGuest && user) return false;

    return true;
  };

  const renderNavItem = (item: NavigationItem) => {
    if (item.mobileOnly || !shouldShowItem(item)) return null;

    // If item has children, render as dropdown
    if (item.children && item.children.length > 0) {
      const visibleChildren = item.children.filter((child) =>
        shouldShowItem(child)
      );
      if (visibleChildren.length === 0) return null;

      return (
        <Menu key={item.path} position="bottom-start">
          <Menu.Target>
            <Button
              variant="subtle"
              size="compact-sm"
              rightSection={<IconChevronDown size={16} />}
              data-testid={`nav-dropdown-${item.label.replace(/[^a-zA-Z0-9]/g, "-")}`}
            >
              {t(item.label)}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {visibleChildren.map((child) => (
              <Menu.Item
                key={child.path}
                component={Link}
                href={child.path}
                onClick={onCloseMenu}
                data-testid={`nav-${child.path.replace(/\//g, "-").substring(1)}`}
              >
                {t(child.label)}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      );
    }

    // Regular navigation item
    return (
      <Button
        key={item.path}
        onClick={onCloseMenu}
        variant="subtle"
        component={Link}
        href={item.path}
        size="compact-sm"
        data-testid={`nav-${item.path.replace(/\//g, "-").substring(1) || "home"}`}
      >
        {t(item.label)}
      </Button>
    );
  };

  return (
    <Group gap="sm" visibleFrom="sm">
      {navItems.map(renderNavItem)}
    </Group>
  );
};

export default DesktopNavigation;
