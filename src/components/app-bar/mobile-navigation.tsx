"use client";
import { useTranslation } from "@/services/i18n/client";
import { Divider, Stack } from "@mantine/core";
import Link from "@/components/link";
import { getNavigationConfig, NavigationItem } from "@/config/navigation";
import useAuth from "@/services/auth/use-auth";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";
import { Button } from "@mantine/core";

interface MobileNavigationProps {
  onCloseMenu?: () => void;
}

const MobileNavigation = ({ onCloseMenu }: MobileNavigationProps) => {
  const { t } = useTranslation("common");
  const { user, isLoaded } = useAuth();
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
    if (item.desktopOnly || !shouldShowItem(item)) return null;

    // If item has children, render them as separate items with indentation
    if (item.children && item.children.length > 0) {
      const visibleChildren = item.children.filter((child) =>
        shouldShowItem(child)
      );
      if (visibleChildren.length === 0) return null;

      return (
        <Stack key={item.path} gap="xs">
          {/* Parent category as disabled button for visual grouping */}
          <Button
            variant="light"
            fullWidth
            disabled
            style={{ cursor: "default" }}
          >
            {t(item.label)}
          </Button>
          {/* Child items with slight indentation */}
          {visibleChildren.map((child) => (
            <Button
              key={child.path}
              component={Link}
              href={child.path}
              variant="subtle"
              fullWidth
              onClick={onCloseMenu}
              style={{ paddingLeft: "24px" }}
            >
              {t(child.label)}
            </Button>
          ))}
        </Stack>
      );
    }

    // Regular navigation item
    return (
      <Button
        key={item.path}
        component={Link}
        href={item.path}
        variant="subtle"
        fullWidth
        onClick={onCloseMenu}
      >
        {t(item.label)}
      </Button>
    );
  };

  return (
    <Stack>
      {/* Navigation Items */}
      {navItems.map(renderNavItem)}
      {/* Authentication Items (mobile only) */}
      {isLoaded && !user && (
        <>
          <Divider />
          <Button
            component={Link}
            href="/sign-in"
            variant="subtle"
            fullWidth
            onClick={onCloseMenu}
          >
            {t("common:navigation.signIn")}
          </Button>
          {IS_SIGN_UP_ENABLED && (
            <Button
              component={Link}
              href="/sign-up"
              variant="subtle"
              fullWidth
              onClick={onCloseMenu}
            >
              {t("common:navigation.signUp")}
            </Button>
          )}
        </>
      )}
    </Stack>
  );
};

export default MobileNavigation;
