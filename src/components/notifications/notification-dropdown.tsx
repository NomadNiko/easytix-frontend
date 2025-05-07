// src/components/notifications/notification-dropdown.tsx
import {
  Stack,
  Group,
  Text,
  Button,
  ScrollArea,
  Divider,
  Center,
  Loader,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import {
  useNotificationsInfiniteQuery,
  useMarkAllNotificationsAsReadMutation,
  notificationsQueryKeys,
} from "@/app/[language]/profile/queries/notifications-queries";
import NotificationItem from "./notification-item";
import { IconInbox } from "@tabler/icons-react";
import { Notification } from "@/services/api/services/notifications";
import useAuth from "@/services/auth/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface NotificationDropdownProps {
  closeMenu: () => void;
  onSelectNotification: (notification: Notification) => void;
}

const NotificationDropdown = ({
  closeMenu,
  onSelectNotification,
}: NotificationDropdownProps) => {
  const { t } = useTranslation("notifications");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Force refetch when dropdown opens
  useEffect(() => {
    // Invalidate notifications query to force a fresh fetch
    queryClient.invalidateQueries({
      queryKey: notificationsQueryKeys.list().key,
    });
  }, [queryClient]);

  // Only fetch notifications when user is authenticated and the dropdown is open
  const { data: infiniteData, isLoading } = useNotificationsInfiniteQuery(
    {
      limit: 5, // Only show 5 most recent notifications
    },
    {
      staleTime: 0,
      refetchOnMount: "always",
    }
  );

  // Get the first page of notifications only for the dropdown
  const notifications = infiniteData?.pages[0]?.data || [];
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  // Don't render if no user to ensure user-specific data
  if (!user) {
    return null;
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleSelectNotification = (notification: Notification) => {
    onSelectNotification(notification);
  };

  return (
    <Stack p="xs" gap="xs">
      <Group justify="space-between">
        <Text fw={600}>{t("notifications:recent")}</Text>
        {notifications.length > 0 && (
          <Button
            variant="subtle"
            size="xs"
            onClick={handleMarkAllAsRead}
            loading={markAllAsReadMutation.isPending}
          >
            {t("notifications:markAllAsRead")}
          </Button>
        )}
      </Group>
      <Divider />
      {isLoading ? (
        <Center p="md">
          <Loader size="sm" />
        </Center>
      ) : notifications.length === 0 ? (
        <Stack align="center" gap="xs" py="md">
          <IconInbox size={32} opacity={0.5} />
          <Text size="sm" color="dimmed" ta="center">
            {t("notifications:noNotifications")}
          </Text>
        </Stack>
      ) : (
        <ScrollArea style={{ maxHeight: 400 }} offsetScrollbars>
          <Stack gap="xs">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={handleSelectNotification}
                showActions={false}
              />
            ))}
          </Stack>
        </ScrollArea>
      )}
      <Divider />
      <Button
        variant="subtle"
        component={Link}
        href="/profile/notifications"
        onClick={closeMenu}
      >
        {t("notifications:viewAll")}
      </Button>
    </Stack>
  );
};

export default NotificationDropdown;
