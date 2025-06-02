"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Badge,
  Group,
  Stack,
  Paper,
  useMantineColorScheme,
} from "@mantine/core";
import { IconUser, IconCalendar } from "@tabler/icons-react";
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
  createdById: string;
  category?: { id: string; name: string };
  queue?: { id: string; name: string };
}

interface TicketBlockProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketBlock({ ticket, onClick }: TicketBlockProps) {
  const [creatorName, setCreatorName] = useState<string>("");
  const getUserService = useGetUserService();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

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
        height: "100%",
        transition: "all 0.2s ease",
        minHeight: "74px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
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
                width: "8px",
                height: "8px",
                backgroundColor: "var(--mantine-color-red-6)",
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
            {ticket.status}
          </Badge>

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
        <Stack gap={2} mt="auto">
          <Group gap="xs" wrap="nowrap">
            <IconUser
              size={10}
              color={
                isDark
                  ? "var(--mantine-color-gray-4)"
                  : "var(--mantine-color-gray-6)"
              }
            />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {creatorName || "Loading..."}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <IconCalendar
              size={10}
              color={
                isDark
                  ? "var(--mantine-color-gray-4)"
                  : "var(--mantine-color-gray-6)"
              }
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
