"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  LoadingOverlay,
  Center,
  Text,
  ActionIcon,
  Group,
  Stack,
  Divider,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { TicketBlock } from "./TicketBlock";
import {
  useGetTicketsService,
  TicketStatus,
} from "@/services/api/services/tickets";
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

interface TimelineMobileProps {
  queueId: string;
  onTicketClick: (ticket: Ticket) => void;
}

export function TimelineMobile({
  queueId,
  onTicketClick,
}: TimelineMobileProps) {
  const { t } = useTranslation("timeline");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const getTicketsService = useGetTicketsService();

  // Generate date range for current week
  const dateRange = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + weekOffset * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push({
        date: new Date(date),
        dateString: date.toISOString().split("T")[0],
        displayDate: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        isToday:
          date.toISOString().split("T")[0] ===
          today.toISOString().split("T")[0],
      });
    }
    return dates;
  }, [weekOffset]);

  // Fetch tickets for the selected queue
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const { status, data } = await getTicketsService(undefined, {
          page: 1,
          limit: 300, // Reduced limit for better performance
          queueId,
          statuses: [
            TicketStatus.OPENED,
            TicketStatus.IN_PROGRESS,
            TicketStatus.RESOLVED,
          ], // Filter at API level
        });

        if (status === HTTP_CODES_ENUM.OK) {
          // Filtering now done at API level for better performance
          const ticketsArray = Array.isArray(data) ? data : data.data || [];
          setTickets(ticketsArray);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (queueId) {
      fetchTickets();
    }
  }, [queueId, getTicketsService]);

  // Group tickets by date
  const ticketsByDate = useMemo(() => {
    const grouped: Record<string, Ticket[]> = {};

    tickets.forEach((ticket) => {
      const createdDate = new Date(ticket.createdAt);
      const dateString = createdDate.toISOString().split("T")[0];

      // Only include tickets within our date range
      if (dateRange.some((d) => d.dateString === dateString)) {
        if (!grouped[dateString]) {
          grouped[dateString] = [];
        }
        grouped[dateString].push(ticket);
      }
    });

    // Sort tickets within each date by priority and creation time
    Object.keys(grouped).forEach((dateString) => {
      grouped[dateString].sort((a, b) => {
        const aPriority =
          a.priority === "HIGH" ? 0 : a.priority === "MEDIUM" ? 1 : 2;
        const bPriority =
          b.priority === "HIGH" ? 0 : b.priority === "MEDIUM" ? 1 : 2;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });

    return grouped;
  }, [tickets, dateRange]);

  // Navigation functions
  const navigateWeek = useCallback((direction: "prev" | "next") => {
    setWeekOffset((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  }, []);

  // Touch handlers for swipe navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateWeek("next");
    } else if (isRightSwipe) {
      navigateWeek("prev");
    }
  };

  const getWeekLabel = () => {
    const startDate = dateRange[0]?.date;
    const endDate = dateRange[6]?.date;

    if (!startDate || !endDate) return "";

    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  if (isLoading) {
    return (
      <Paper p="xl" withBorder h={400} pos="relative">
        <LoadingOverlay visible />
        <Center h="100%">
          <Text>{t("timeline:loading.tickets")}</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper
      withBorder
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Week Navigation */}
      <Box
        p="md"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Group justify="space-between" align="center">
          <ActionIcon
            variant="light"
            color="blue"
            size="lg"
            onClick={() => navigateWeek("prev")}
          >
            <IconChevronLeft size={20} />
          </ActionIcon>

          <Text fw={600} size="lg">
            {getWeekLabel()}
          </Text>

          <ActionIcon
            variant="light"
            color="blue"
            size="lg"
            onClick={() => navigateWeek("next")}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Group>

        <Text size="xs" c="dimmed" ta="center" mt="xs">
          Swipe left/right or use arrows to navigate
        </Text>
      </Box>

      {/* Timeline Content */}
      <ScrollArea style={{ height: "calc(100vh - 300px)" }}>
        <Box p="md">
          {dateRange.map((dateInfo) => {
            const dayTickets = ticketsByDate[dateInfo.dateString] || [];

            return (
              <Box key={dateInfo.dateString} mb="lg">
                {/* Date Header */}
                <Paper
                  p="sm"
                  mb="md"
                  withBorder={dateInfo.isToday}
                  style={{
                    backgroundColor: dateInfo.isToday
                      ? "var(--mantine-color-blue-0)"
                      : undefined,
                    borderColor: dateInfo.isToday
                      ? "var(--mantine-color-blue-6)"
                      : undefined,
                    borderWidth: dateInfo.isToday ? "2px" : undefined,
                    borderRadius: "8px",
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Text fw={600} size="lg">
                      {dateInfo.displayDate}
                    </Text>
                    {dayTickets.length > 0 && (
                      <Badge color="blue" variant="light" size="sm">
                        {dayTickets.length} ticket
                        {dayTickets.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </Group>
                </Paper>

                {/* Tickets for this date */}
                {dayTickets.length > 0 ? (
                  <Stack gap="sm">
                    {dayTickets.map((ticket) => (
                      <TicketBlock
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => onTicketClick(ticket)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Center py="xl">
                    <Text size="sm" c="dimmed">
                      No tickets for this date
                    </Text>
                  </Center>
                )}

                {/* Divider between dates (except last) */}
                {dateInfo !== dateRange[dateRange.length - 1] && (
                  <Divider mt="xl" />
                )}
              </Box>
            );
          })}

          {/* Overall empty state */}
          {Object.keys(ticketsByDate).length === 0 && (
            <Center py="xl">
              <Text c="dimmed">{t("timeline:empty.noTickets")}</Text>
            </Center>
          )}
        </Box>
      </ScrollArea>
    </Paper>
  );
}
