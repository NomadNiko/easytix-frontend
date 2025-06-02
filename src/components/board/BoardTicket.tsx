"use client";

import React, { useEffect, useState } from "react";
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
import { IconGripVertical, IconUser, IconCalendar } from "@tabler/icons-react";
import { formatDate } from "@/utils/format-date";
import { useGetUserService } from "@/services/api/services/users";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

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
}

interface BoardTicketProps {
  ticket: Ticket;
  onClick?: () => void;
}

export function BoardTicket({ ticket, onClick }: BoardTicketProps) {
  const [creatorName, setCreatorName] = useState<string>("");
  const getUserService = useGetUserService();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: ticket.id,
    });

  // Fetch creator name
  useEffect(() => {
    const fetchCreator = async () => {
      if (ticket.createdById) {
        try {
          const response = await getUserService({ id: ticket.createdById });
          if (response.status === HTTP_CODES_ENUM.OK && response.data) {
            const firstName = response.data.firstName || "";
            const lastName = response.data.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            setCreatorName(fullName || response.data.email);
          }
        } catch (error) {
          console.error("Error fetching creator:", error);
        }
      }
    };
    fetchCreator();
  }, [ticket.createdById, getUserService]);

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
              size={theme.other.iconSizes.md}
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
            {ticket.priority}
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
              size={theme.other.iconSizes.sm}
              color={isDark ? theme.colors.gray[4] : theme.colors.gray[6]}
            />
            <Text size="xs" c="dimmed">
              {creatorName || "Loading..."}
            </Text>
          </Group>
          <Group gap="xs">
            <IconCalendar
              size={theme.other.iconSizes.sm}
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
