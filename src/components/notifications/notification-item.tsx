// src/components/notifications/notification-item.tsx
import {
  Box,
  Group,
  Text,
  ActionIcon,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { formatDistance } from "date-fns";
import { Notification } from "@/services/api/services/notifications";
import {
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} from "@/app/[language]/profile/queries/notifications-queries";

interface NotificationItemProps {
  notification: Notification;
  onSelect: (notification: Notification) => void;
  onClick?: () => void;
  showActions?: boolean;
}

const NotificationItem = ({
  notification,
  onSelect,
  onClick,
  showActions = true,
}: NotificationItemProps) => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  // Format relative time (e.g., "2 hours ago")
  const relativeTime = formatDistance(
    new Date(notification.createdAt),
    new Date(),
    { addSuffix: true }
  );

  const handleClick = () => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }
    onSelect(notification);
    if (onClick) onClick();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteNotificationMutation.mutate({ id: notification.id });
  };

  // Determine if message is long and should be truncated
  const isLongMessage = notification.message.length > 120;
  const truncatedMessage = isLongMessage
    ? `${notification.message.slice(0, 120)}...`
    : notification.message;

  return (
    <Box
      style={{
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        backgroundColor: notification.isRead
          ? "transparent"
          : isDark
            ? theme.colors.blue[9] // Dark mode unread background
            : theme.colors.blue[0], // Light mode unread background
        transition: "background-color 0.2s",
        border: notification.isRead
          ? undefined
          : isDark
            ? `1px solid ${theme.colors.blue[7]}` // Dark mode unread border
            : `1px solid ${theme.colors.blue[3]}`, // Light mode unread border
        cursor: "pointer",
        "&:hover": {
          backgroundColor: isDark
            ? theme.colors.dark[6] // Dark mode hover
            : theme.colors.gray[1], // Light mode hover
        },
      }}
      onClick={handleClick}
    >
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Box style={{ flexGrow: 1, overflow: "hidden" }}>
          <Text fw={notification.isRead ? 400 : 700} size="sm" lineClamp={1}>
            {notification.title}
          </Text>
          <Text size="xs" color="dimmed">
            {relativeTime}
          </Text>
          <Text size="sm" lineClamp={2} mt="xs">
            {truncatedMessage}
          </Text>
        </Box>
        {showActions && (
          <ActionIcon
            size="sm"
            color="red"
            onClick={handleDelete}
            loading={deleteNotificationMutation.isPending}
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Box>
  );
};

export default NotificationItem;
