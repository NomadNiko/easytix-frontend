// src/components/app-bar/notification-icon.tsx
"use client";
import { useState } from "react";
import { ActionIcon, Indicator, Menu } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { useUnreadNotificationsCountQuery } from "@/app/[language]/profile/queries/notifications-queries";
import NotificationDropdown from "@/components/notifications/notification-dropdown";
import useAuth from "@/services/auth/use-auth";
import { useResponsive } from "@/services/responsive/use-responsive";

const NotificationIcon = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const { user, isLoaded } = useAuth();
  const { data: unreadCount = 0, isLoading } =
    useUnreadNotificationsCountQuery();
  const { isMobile } = useResponsive();

  if (!isLoaded || !user) {
    return null; // Don't show to unauthenticated users
  }

  const handleToggleMenu = () => {
    setMenuOpened((prev) => !prev);
  };

  return (
    <Menu
      opened={menuOpened}
      onChange={setMenuOpened}
      position="bottom-end"
      offset={5}
      shadow="md"
      width={isMobile ? 300 : 350}
      withArrow
    >
      <Menu.Target>
        <Indicator
          disabled={!unreadCount || isLoading}
          label={unreadCount > 99 ? "99+" : unreadCount}
          size={16}
          offset={4}
          inline
          color="red"
          withBorder
        >
          <ActionIcon
            onClick={handleToggleMenu}
            variant="transparent"
            color="blue"
            aria-label="Notifications"
            size="lg"
          >
            <IconBell size={24} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>
      <Menu.Dropdown>
        <NotificationDropdown closeMenu={() => setMenuOpened(false)} />
      </Menu.Dropdown>
    </Menu>
  );
};

export default NotificationIcon;
