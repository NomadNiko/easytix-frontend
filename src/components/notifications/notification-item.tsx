// src/components/notifications/notification-item.tsx - fix for Link issues
"use client";
import { useState } from "react";
import {
  Box,
  Group,
  Text,
  ActionIcon,
  useMantineTheme,
  Collapse,
  Stack,
} from "@mantine/core";
import { IconTrash, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { formatDistance } from "date-fns";
import {
  Notification,
  useMarkNotificationAsReadService,
  useDeleteNotificationService,
} from "@/services/api/services/notifications";
import Link from "@/components/link";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  expanded?: boolean; // Whether to show expanded by default (used on notifications page)
  showActions?: boolean; // Whether to show delete button
}

const NotificationItem = ({
  notification,
  onClick,
  expanded = false,
  showActions = true,
}: NotificationItemProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const theme = useMantineTheme();
  const markAsReadService = useMarkNotificationAsReadService();
  const deleteNotificationService = useDeleteNotificationService();

  // Format relative time (e.g., "2 hours ago")
  const relativeTime = formatDistance(
    new Date(notification.createdAt),
    new Date(),
    { addSuffix: true }
  );

  const handleClick = () => {
    if (!notification.isRead) {
      markAsReadService(undefined, { id: notification.id });
    }

    if (notification.link) {
      if (onClick) onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteNotificationService({ id: notification.id });
  };

  const handleToggleExpand = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Determine if message is long and should be truncated
  const isLongMessage = notification.message.length > 120;
  const truncatedMessage = isLongMessage
    ? `${notification.message.slice(0, 120)}...`
    : notification.message;

  // Component to render
  const NotificationContent = () => (
    <Box
      style={{
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        backgroundColor: notification.isRead
          ? "transparent"
          : theme.colors.blue[0],
        transition: "background-color 0.2s",
        border: notification.isRead
          ? undefined
          : `1px solid ${theme.colors.blue[3]}`,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: theme.colors.gray[1],
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

          <Collapse in={isExpanded}>
            <Text size="sm" mt="xs">
              {notification.message}
            </Text>
          </Collapse>

          {!isExpanded && (
            <Text size="sm" lineClamp={2} mt="xs">
              {truncatedMessage}
            </Text>
          )}
        </Box>

        <Stack gap={4}>
          {isLongMessage && (
            <ActionIcon size="sm" onClick={handleToggleExpand} variant="subtle">
              {isExpanded ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </ActionIcon>
          )}

          {showActions && (
            <ActionIcon size="sm" color="red" onClick={handleDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Stack>
      </Group>
    </Box>
  );

  // Render with link if notification has a link
  if (notification.link) {
    // Return a div that wraps the Link wrapper + NotificationContent
    return (
      <div
        onClick={handleClick}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Link href={notification.link} />
        <NotificationContent />
      </div>
    );
  }

  // Otherwise render as regular component
  return <NotificationContent />;
};

export default NotificationItem;
