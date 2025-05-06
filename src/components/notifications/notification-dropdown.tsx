// src/components/notifications/notification-dropdown.tsx
"use client";
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
  useNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
} from "@/app/[language]/profile/queries/notifications-queries";
import NotificationItem from "./notification-item";
import { IconInbox } from "@tabler/icons-react";

interface NotificationDropdownProps {
  closeMenu: () => void;
}

const NotificationDropdown = ({ closeMenu }: NotificationDropdownProps) => {
  const { t } = useTranslation("notifications");
  const { data: notifications = [], isLoading } = useNotificationsQuery({
    limit: 5, // Only show 5 most recent notifications
    page: 1,
  });

  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
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
                onClick={closeMenu}
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
