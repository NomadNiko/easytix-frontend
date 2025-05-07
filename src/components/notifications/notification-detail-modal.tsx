// src/components/notifications/notification-detail-modal.tsx
import { useState } from "react";
import { Modal, Text, Group, Button, Paper, Stack } from "@mantine/core";
import { formatDistance } from "date-fns";
import { Notification } from "@/services/api/services/notifications";
import { IconTrash } from "@tabler/icons-react";
import {
  useDeleteNotificationMutation,
  useMarkNotificationAsReadMutation,
} from "@/app/[language]/profile/queries/notifications-queries";
import { useTranslation } from "@/services/i18n/client";

interface NotificationDetailModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
}: NotificationDetailModalProps) {
  const { t } = useTranslation("notifications");
  const deleteMutation = useDeleteNotificationMutation();
  const markAsReadMutation = useMarkNotificationAsReadMutation();

  // If the notification isn't marked as read yet, mark it when opening the modal
  useState(() => {
    if (notification && !notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }
  });

  const handleDelete = async () => {
    if (!notification) return;
    await deleteMutation.mutateAsync({ id: notification.id });
    onClose();
  };

  if (!notification) return null;

  const formattedDate = formatDistance(
    new Date(notification.createdAt),
    new Date(),
    { addSuffix: true }
  );

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={notification.title}
      centered
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {formattedDate}
        </Text>
        <Paper p="md" withBorder>
          <Text>{notification.message}</Text>
        </Paper>
        {notification.link && (
          <Button
            component="a"
            href={notification.link}
            variant="light"
            fullWidth
            onClick={onClose}
          >
            {notification.linkLabel || t("notifications:viewLink")}
          </Button>
        )}
        <Group justify="space-between" mt="md">
          <Button onClick={onClose} variant="subtle">
            {t("notifications:close")}
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            variant="light"
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          >
            {t("notifications:delete")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
