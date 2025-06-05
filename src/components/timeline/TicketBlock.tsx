"use client";

import React from "react";
import {
  Box,
  Text,
  Badge,
  Group,
  Stack,
  Paper,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconUser, IconCalendar } from "@tabler/icons-react";
import { formatDate } from "@/utils/format-date";
import { useTranslation } from "@/services/i18n/client";

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
  createdById: string;
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

interface TicketBlockProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketBlock({ ticket, onClick }: TicketBlockProps) {
  const { t } = useTranslation("tickets");
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";

  // Get creator name from included user data
  const creatorName = ticket.createdBy
    ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`.trim() ||
      ticket.createdBy.email
    : "Unknown User";

  // Use standard status color mapping like the rest of the app
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Opened":
        return "blue";
      case "In Progress":
        return "yellow";
      case "Resolved":
        return "green";
      case "Closed":
        return "gray";
      default:
        return "gray";
    }
  };

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
    e.stopPropagation();
    onClick();
  };

  return (
    <Paper
      p="sm"
      withBorder
      shadow="sm"
      onClick={handleClick}
      style={{
        cursor: "pointer",
        height: theme.other.heights.full,
        transition: theme.other.transitions.base,
        minHeight: theme.other.heights.ticket,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = theme.shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.shadows.sm;
      }}
    >
      <Stack gap="xs" h="100%">
        <Group justify="space-between" align="flex-start">
          <Text size="xs" c="dimmed" fw={500}>
            #{ticket.id.slice(-6)}
          </Text>
          {ticket.priority === "HIGH" && (
            <Box
              style={{
                width: theme.other.priorityIndicator.size,
                height: theme.other.priorityIndicator.size,
                backgroundColor: theme.colors.red[6],
                borderRadius: "50%",
              }}
            />
          )}
        </Group>

        <Text fw={500} size="sm" lineClamp={2}>
          {ticket.title}
        </Text>

        <Group gap="xs" wrap="nowrap">
          <Badge
            size="xs"
            color={getStatusColor(ticket.status)}
            variant="light"
          >
            {t(`tickets:tickets.statuses.${ticket.status}`)}
          </Badge>

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
        <Stack gap={2} mt="auto">
          <Group gap="xs" wrap="nowrap">
            <IconUser
              size={theme.other.iconSizesPixels.xs}
              color={isDark ? theme.colors.gray[4] : theme.colors.gray[6]}
            />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {creatorName}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <IconCalendar
              size={theme.other.iconSizesPixels.xs}
              color={isDark ? theme.colors.gray[4] : theme.colors.gray[6]}
            />
            <Text size="xs" c="dimmed">
              {formatDate(new Date(ticket.createdAt))}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}
