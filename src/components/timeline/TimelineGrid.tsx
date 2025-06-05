"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  Paper,
  LoadingOverlay,
  Center,
  Text,
  ScrollArea,
  ActionIcon,
  Group,
  Stack,
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

interface TimelineGridProps {
  queueId: string;
  onTicketClick: (ticket: Ticket) => void;
}

export function TimelineGrid({ queueId, onTicketClick }: TimelineGridProps) {
  const { t } = useTranslation("timeline");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getTicketsService = useGetTicketsService();

  // Navigation state
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate date columns (showing 1 week view with navigation)
  const dateColumns = useMemo(() => {
    const dates = [];
    const today = new Date();

    // Calculate the start of the week based on offset
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + weekOffset * 7); // Start from 6 days ago, adjusted by week offset

    // Generate 7 days worth of columns
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isToday =
        date.toISOString().split("T")[0] === today.toISOString().split("T")[0];

      dates.push({
        date: new Date(date),
        dateString: date.toISOString().split("T")[0],
        displayDay: date.getDate(),
        displayMonth: date.toLocaleDateString("en-US", { month: "short" }),
        displayYear: date.getFullYear(),
        displayDayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        isToday: isToday,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
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
          // Handle paginated response format - filtering now done at API level
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

  // Auto-scroll to show the full week (no scrolling needed for 1 week view)
  useEffect(() => {
    if (!isLoading && !isInitialized && dateColumns.length > 0) {
      // For 1 week view, we don't need to scroll - just mark as initialized
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized, dateColumns]);

  // Navigation functions - navigate by week
  const navigateWeek = useCallback((direction: "prev" | "next") => {
    setWeekOffset((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  }, []);

  const scrollLeft = useCallback(() => {
    navigateWeek("prev");
  }, [navigateWeek]);

  const scrollRight = useCallback(() => {
    navigateWeek("next");
  }, [navigateWeek]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollLeft();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollRight();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [scrollLeft, scrollRight]);

  // Calculate ticket positioning - each ticket takes exactly 1 day width based on creation date
  const calculateTicketLayout = useCallback(
    (ticket: Ticket) => {
      const createdDate = new Date(ticket.createdAt);

      // Find the column index for the creation date
      const columnIndex = dateColumns.findIndex(
        (col) => col.dateString === createdDate.toISOString().split("T")[0]
      );

      // If ticket was created before our date range, don't show it
      // If ticket was created after our date range, don't show it
      const isVisible = columnIndex >= 0;

      return {
        leftOffset: columnIndex >= 0 ? columnIndex : 0,
        width: 1, // Always exactly 1 day width
        isVisible,
      };
    },
    [dateColumns]
  );

  // Calculate positioning for all tickets with space-efficient layout
  const ticketPositions = useMemo(() => {
    const visibleTickets = tickets.filter((ticket) => {
      const layout = calculateTicketLayout(ticket);
      return layout.isVisible;
    });

    // Sort tickets by priority (High first), then by creation date
    const sortedTickets = [...visibleTickets].sort((a, b) => {
      // First priority: High priority tickets first
      const aPriority =
        a.priority === "HIGH" ? 0 : a.priority === "MEDIUM" ? 1 : 2;
      const bPriority =
        b.priority === "HIGH" ? 0 : b.priority === "MEDIUM" ? 1 : 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Second priority: chronological order by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Track occupied columns for each row
    const rows: Array<Array<{ start: number; end: number; ticketId: string }>> =
      [];

    const positions = sortedTickets.map((ticket) => {
      const layout = calculateTicketLayout(ticket);
      const startCol = layout.leftOffset;
      const endCol = layout.leftOffset + layout.width - 1;

      // Find the first row where this ticket can fit
      let targetRow = 0;

      while (targetRow < rows.length) {
        const currentRow = rows[targetRow];

        // Check if there's space in this row
        const hasConflict = currentRow.some(
          (occupied) => !(endCol < occupied.start || startCol > occupied.end)
        );

        if (!hasConflict) {
          // Found space in this row
          break;
        }

        targetRow++;
      }

      // If no existing row has space, create a new row
      if (targetRow >= rows.length) {
        rows.push([]);
      }

      // Add this ticket to the row
      rows[targetRow].push({
        start: startCol,
        end: endCol,
        ticketId: ticket.id,
      });

      return {
        ticket,
        layout,
        row: targetRow,
      };
    });

    return positions;
  }, [tickets, calculateTicketLayout]);

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
    <Paper withBorder>
      {/* Navigation Controls */}
      <Box
        p="sm"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Group justify="center" gap="md">
          <ActionIcon
            variant="light"
            color="blue"
            size="lg"
            onClick={scrollLeft}
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          >
            <IconChevronLeft size={20} />
          </ActionIcon>

          <Text size="sm" c="dimmed" fw={500}>
            Use arrows or ← → keys to navigate timeline • Today is highlighted
          </Text>

          <ActionIcon
            variant="light"
            color="blue"
            size="lg"
            onClick={scrollRight}
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <ScrollArea
        type="never"
        style={{
          overflow: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        viewportRef={scrollAreaRef}
        styles={{
          scrollbar: { display: "none" },
          thumb: { display: "none" },
          corner: { display: "none" },
        }}
      >
        <Box
          p="md"
          style={{
            minWidth: "100%",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >
          {/* Date Header */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dateColumns.length}, 1fr)`,
              gap: "6px",
              marginBottom: "16px",
            }}
          >
            {/* Date columns */}
            {dateColumns.map((dateCol) => (
              <Paper
                key={dateCol.dateString}
                p="xs"
                withBorder={dateCol.isToday}
                style={{
                  textAlign: "center",
                  backgroundColor: dateCol.isToday
                    ? "var(--mantine-color-blue-0)"
                    : undefined,
                  borderColor: dateCol.isToday
                    ? "var(--mantine-color-blue-6)"
                    : undefined,
                  borderWidth: dateCol.isToday ? "2px" : undefined,
                  minHeight: "40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Text fw={700} size="md">
                  {dateCol.displayDay}
                </Text>
                <Text size="xs" c="dimmed">
                  {dateCol.displayDayName}
                </Text>
                <Text size="xs" c="dimmed">
                  {dateCol.displayMonth}
                </Text>
              </Paper>
            ))}
          </Box>

          {/* Timeline Grid */}
          <Box>
            {ticketPositions.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">{t("timeline:empty.noTickets")}</Text>
              </Center>
            ) : (
              <Stack gap="xs">
                {Array.from({
                  length: Math.max(
                    1,
                    Math.max(...ticketPositions.map((p) => p.row)) + 1
                  ),
                }).map((_, rowIndex) => (
                  <Box
                    key={`row-${rowIndex}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${dateColumns.length}, 1fr)`,
                      gap: "6px",
                      minHeight: "80px",
                      alignItems: "stretch",
                    }}
                  >
                    {/* Ticket cells for each date column */}
                    {dateColumns.map((dateCol, colIndex) => {
                      const ticketInCell = ticketPositions.find(
                        ({ layout, row }) =>
                          row === rowIndex && layout.leftOffset === colIndex
                      );

                      return (
                        <Box
                          key={`${rowIndex}-${colIndex}`}
                          style={{
                            minHeight: "80px",
                            border: "1px dashed var(--mantine-color-gray-3)",
                            borderRadius: "4px",
                            padding: "3px",
                          }}
                        >
                          {ticketInCell && (
                            <TicketBlock
                              ticket={ticketInCell.ticket}
                              onClick={() => onTicketClick(ticketInCell.ticket)}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </ScrollArea>
    </Paper>
  );
}
