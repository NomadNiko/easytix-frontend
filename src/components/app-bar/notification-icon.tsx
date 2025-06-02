// src/components/app-bar/notification-icon.tsx
// src/components/app-bar/notification-icon.tsx
import { useState, useEffect } from "react";
import { ActionIcon, Indicator, Menu, useMantineTheme } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { useUnreadNotificationsCountQuery } from "@/app/[language]/profile/queries/notifications-queries";
import NotificationDropdown from "@/components/notifications/notification-dropdown";
import NotificationDetailModal from "@/components/notifications/notification-detail-modal";
import useAuth from "@/services/auth/use-auth";
import { useResponsive } from "@/services/responsive/use-responsive";
import { Notification } from "@/services/api/services/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsQueryKeys } from "@/app/[language]/profile/queries/notifications-queries";

const NotificationIcon = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { user, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const { isMobile } = useResponsive();
  const theme = useMantineTheme();

  // Only enable the polling when the user is authenticated
  const { data: unreadCount = 0, isLoading } = useUnreadNotificationsCountQuery(
    isLoaded && !!user
  );

  // Clear notification cache when user changes or logs out
  useEffect(() => {
    return () => {
      if (!user) {
        // Clear notification cache when component unmounts or user logs out
        queryClient.removeQueries({
          queryKey: notificationsQueryKeys.list().key,
        });
        queryClient.removeQueries({
          queryKey: notificationsQueryKeys.unreadCount().key,
        });
      }
    };
  }, [user, queryClient]);

  if (!isLoaded || !user) {
    return null; // Don't show to unauthenticated users
  }

  const handleToggleMenu = () => {
    setMenuOpened((prev) => !prev);
    // Force a refetch when we open the menu to ensure fresh data
    if (!menuOpened) {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.list().key,
      });
    }
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
            size={20} /* Increased from 16 to 20 for more space */
            offset={4}
            inline
            color="red"
            withBorder
            processing={false}
            styles={{
              indicator: {
                padding:
                  unreadCount > 9
                    ? `0 ${theme.other.spacing[6]}`
                    : `0 ${theme.other.spacing[4]}`,
                fontSize: theme.fontSizes.xs,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth:
                  unreadCount > 99 ? theme.other.spacing[24] : unreadCount > 9 ? theme.other.spacing[20] : theme.other.spacing[16],
                height: theme.other.spacing[20],
                lineHeight: 1,
                paddingTop: theme.other.spacing[2],
              },
            }}
          >
            <ActionIcon
              onClick={handleToggleMenu}
              variant="transparent"
              color="blue"
              aria-label="Notifications"
              size="lg"
            >
              <IconBell size={theme.other.iconSizes.xl} />
            </ActionIcon>
          </Indicator>
        </Menu.Target>
        <Menu.Dropdown>
          {menuOpened && ( // Only render dropdown content when the menu is open
            <NotificationDropdown
              closeMenu={() => setMenuOpened(false)}
              onSelectNotification={handleSelectNotification}
            />
          )}
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
