"use client";

import React from "react";
import {
  Paper,
  Stack,
  Text,
  Badge,
  ScrollArea,
  Box,
  Group,
  useMantineColorScheme,
} from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import { BoardTicket } from "./BoardTicket";

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

interface BoardColumnProps {
  id: string;
  title: string;
  tickets: Ticket[];
  color: string;
  onTicketClick?: (ticket: Ticket) => void;
}

export function BoardColumn({
  id,
  title,
  tickets,
  color,
  onTicketClick,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Paper
      ref={setNodeRef}
      p="md"
      withBorder
      h={600}
      style={{
        backgroundColor: isOver
          ? isDark
            ? "var(--mantine-color-dark-6)"
            : "var(--mantine-color-gray-0)"
          : "transparent",
        transition: "background-color 200ms ease",
      }}
    >
      <Stack h="100%">
        <Group justify="space-between" mb="md">
          <Text fw={600} size="lg">
            {title}
          </Text>
          <Badge color={color} variant="filled">
            {tickets.length}
          </Badge>
        </Group>

        <ScrollArea flex={1} offsetScrollbars>
          <Stack gap="sm">
            {tickets.map((ticket) => (
              <BoardTicket
                key={ticket.id}
                ticket={ticket}
                onClick={() => onTicketClick?.(ticket)}
              />
            ))}

            {tickets.length === 0 && (
              <Box p="xl" ta="center">
                <Text c="dimmed" size="sm">
                  No tickets
                </Text>
              </Box>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
