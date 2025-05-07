// src/components/app-bar/notification-icon.tsx
import { useState } from "react";
import { ActionIcon, Indicator, Menu } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { useUnreadNotificationsCountQuery } from "@/app/[language]/profile/queries/notifications-queries";
import NotificationDropdown from "@/components/notifications/notification-dropdown";
import NotificationDetailModal from "@/components/notifications/notification-detail-modal";
import useAuth from "@/services/auth/use-auth";
import { useResponsive } from "@/services/responsive/use-responsive";
import { Notification } from "@/services/api/services/notifications";

const NotificationIcon = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const handleSelectNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    setMenuOpened(false); // Close the menu after selecting a notification
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  return (
    <>
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
          <NotificationDropdown
            closeMenu={() => setMenuOpened(false)}
            onSelectNotification={handleSelectNotification}
          />
        </Menu.Dropdown>
      </Menu>

      {/* Moved outside of the dropdown to prevent unmounting */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </>
  );
};

export default NotificationIcon;
