"use client";

import React from "react";
import {
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  Box,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "@/services/i18n/client";
import { IconGripVertical, IconUser, IconCalendar } from "@tabler/icons-react";
import { formatDate } from "@/utils/format-date";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  queueId: string;
  categoryId: string;
  createdAt: string;
  closedAt: string | null;
  closingNotes: string | null;
  createdById: string;
  details: string;
  category?: { id: string; name: string };
  queue?: { id: string; name: string };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface BoardTicketProps {
  ticket: Ticket;
  onClick?: () => void;
}

export function BoardTicket({ ticket, onClick }: BoardTicketProps) {
  const { t } = useTranslation("tickets");
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: ticket.id,
    });

  // Get creator name from included user data
  const creatorName = ticket.createdBy
    ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`.trim() ||
      ticket.createdBy.email
    : "Unknown User";

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? theme.other.opacity.subtle : 1,
    cursor: isDragging ? "grabbing" : "pointer",
  } as React.CSSProperties;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "green";
      default:
        return "gray";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click when dragging
    if (!isDragging && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      p="sm"
      withBorder
      shadow="sm"
      onClick={handleClick}
      {...attributes}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Box
            {...listeners}
            style={{
              cursor: "grab",
              padding: theme.other.spacing[4],
              borderRadius: theme.radius.xs,
              transition: `background-color ${theme.other.transitions.base}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? theme.colors.dark[5]
                : theme.colors.gray[1];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <IconGripVertical
              size={theme.other.iconSizesPixels.md}
              style={{
                color: isDark ? theme.colors.gray[4] : theme.colors.gray[5],
              }}
            />
          </Box>
          <Text size="xs" c="dimmed">
            #{ticket.id.slice(-6)}
          </Text>
        </Group>

        <Text fw={500} size="sm" lineClamp={2}>
          {ticket.title}
        </Text>

        <Group gap="xs">
          <Badge
            size="xs"
            color={getPriorityColor(ticket.priority)}
            variant="light"
          >
            {t(`tickets:tickets.priorities.${ticket.priority}`)}
          </Badge>

          {ticket.category && (
            <Badge size="xs" color="gray" variant="light">
              {ticket.category.name}
            </Badge>
          )}
        </Group>

        {/* Creator and Date info */}
        <Stack gap={4}>
          <Group gap="xs">
            <IconUser
              size={theme.other.iconSizesPixels.sm}
              color={isDark ? theme.colors.gray[4] : theme.colors.gray[6]}
            />
            <Text size="xs" c="dimmed">
              {creatorName}
            </Text>
          </Group>
          <Group gap="xs">
            <IconCalendar
              size={theme.other.iconSizesPixels.sm}
              color={isDark ? theme.colors.gray[4] : theme.colors.gray[6]}
            />
            <Text size="xs" c="dimmed">
              {formatDate(new Date(ticket.createdAt))}
            </Text>
          </Group>
        </Stack>

        {ticket.closingNotes && (
          <Box
            p="xs"
            style={{
              borderRadius: theme.radius.xs,
              backgroundColor: isDark
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
            }}
          >
            <Text size="xs" c="dimmed" lineClamp={2}>
              {ticket.closingNotes}
            </Text>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
