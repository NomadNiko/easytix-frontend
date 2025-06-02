"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  LoadingOverlay,
  Paper,
  Center,
  Text,
  SimpleGrid,
  Select,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { useTranslation } from "@/services/i18n/client";
import {
  useGetTicketsService,
  useAssignTicketService,
  useUpdateTicketStatusService,
  useUpdateTicketService,
  TicketStatus,
} from "@/services/api/services/tickets";
import { useGetQueuesService } from "@/services/api/services/queues";
import { BoardColumn } from "./BoardColumn";
import { BoardTicket } from "./BoardTicket";
import { BoardMobile } from "./BoardMobile";
import { AssignUserModal } from "./AssignUserModal";
import { ClosingNotesModal } from "./ClosingNotesModal";
import { ExpandedTicketModal } from "./ExpandedTicketModal";
import { ResponsiveDisplay } from "@/components/responsive-display/ResponsiveDisplay";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

// Dynamic import for modal to prevent flashing
const TicketActionModal = React.lazy(() =>
  import("../timeline/TicketActionModal").then((module) => ({
    default: module.TicketActionModal,
  }))
);

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

interface Queue {
  id: string;
  name: string;
  description: string;
  assignedUserIds: string[];
}

export function BoardView() {
  const { t } = useTranslation("board");
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [closingNotesModalOpen, setClosingNotesModalOpen] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<Ticket | null>(null);
  const [expandedModalOpen, setExpandedModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const getTicketsService = useGetTicketsService();
  const getQueuesService = useGetQueuesService();
  const assignTicketService = useAssignTicketService();
  const updateTicketStatusService = useUpdateTicketStatusService();
  const updateTicketService = useUpdateTicketService();

  // Load queues on mount
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const { status, data } = await getQueuesService(undefined, {
          page: 1,
          limit: 100,
        });

        if (status === HTTP_CODES_ENUM.OK) {
          const queuesArray = Array.isArray(data) ? data : data.data || [];
          setQueues(queuesArray);

          // Auto-select first queue
          if (queuesArray.length > 0) {
            setSelectedQueueId(queuesArray[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching queues:", error);
      }
    };

    fetchQueues();
  }, [getQueuesService]);

  // Reusable fetch function
  const fetchTickets = useCallback(
    async (showLoader = false) => {
      if (!selectedQueueId) return;

      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const { status, data } = await getTicketsService(undefined, {
          page: 1,
          limit: 1000,
          queueId: selectedQueueId,
        });

        if (status === HTTP_CODES_ENUM.OK) {
          const ticketsArray = Array.isArray(data) ? data : data.data || [];
          console.log("Loaded tickets:", ticketsArray);
          setTickets(ticketsArray);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setTickets([]);
      } finally {
        if (showLoader) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [selectedQueueId, getTicketsService]
  );

  // Load tickets for selected queue
  useEffect(() => {
    fetchTickets(true); // Show loader on initial load
  }, [fetchTickets]);

  // Filter tickets into columns
  const openedTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.OPENED
  );

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.IN_PROGRESS
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.RESOLVED
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const ticket = tickets.find((t) => t.id === active.id);
    if (!ticket) return;

    setDraggedTicket(ticket);

    // Handle drop on different columns
    if (over.id === "opened" && ticket.status !== TicketStatus.OPENED) {
      // Moving to opened - unassign and set status to OPENED
      try {
        const response = await updateTicketService(
          {
            assignedToId: null,
            status: TicketStatus.OPENED,
          },
          { id: ticket.id }
        );

        if (response.status === HTTP_CODES_ENUM.OK) {
          // Refresh tickets without showing loader
          await fetchTickets(false);
        }
      } catch (error) {
        console.error("Error updating ticket:", error);
      }
      setDraggedTicket(null);
    } else if (
      over.id === "in-progress" &&
      ticket.status !== TicketStatus.IN_PROGRESS
    ) {
      // Moving to in-progress - show assign modal if not assigned
      if (!ticket.assignedToId) {
        setAssignModalOpen(true);
      } else {
        // Just update status to IN_PROGRESS
        try {
          const response = await updateTicketStatusService(
            { status: TicketStatus.IN_PROGRESS },
            { id: ticket.id }
          );

          if (response.status === HTTP_CODES_ENUM.OK) {
            await fetchTickets(false);
          }
        } catch (error) {
          console.error("Error updating ticket status:", error);
        }
        setDraggedTicket(null);
      }
    } else if (
      over.id === "resolved" &&
      ticket.status !== TicketStatus.RESOLVED
    ) {
      // Moving to resolved - show closing notes modal
      setClosingNotesModalOpen(true);
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!draggedTicket) return;

    try {
      const response = await assignTicketService(
        { userId: userId },
        { id: draggedTicket.id }
      );

      if (response.status === HTTP_CODES_ENUM.OK) {
        // Refresh tickets without showing loader
        await fetchTickets(false);
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
    }

    setAssignModalOpen(false);
    setDraggedTicket(null);
  };

  const handleCloseTicket = async (closingNotes: string) => {
    if (!draggedTicket) return;

    try {
      const response = await updateTicketStatusService(
        {
          status: TicketStatus.RESOLVED,
          closingNotes: closingNotes,
        },
        { id: draggedTicket.id }
      );

      if (response.status === HTTP_CODES_ENUM.OK) {
        // Refresh tickets without showing loader
        await fetchTickets(false);
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }

    setClosingNotesModalOpen(false);
    setDraggedTicket(null);
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsActionModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setIsActionModalOpen(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  if (isLoading) {
    return (
      <Paper p="xl" withBorder h={600} pos="relative">
        <LoadingOverlay visible />
        <Center h="100%">
          <Text>{t("board:loading.tickets")}</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Queue Selector - Shared between mobile and desktop */}
      <Paper p="sm" mb="lg" withBorder>
        <Select
          label={t("board:selectQueue")}
          placeholder={t("board:selectQueuePlaceholder")}
          data={queues.map((q) => ({ value: q.id, label: q.name }))}
          value={selectedQueueId}
          onChange={setSelectedQueueId}
          searchable
          clearable={false}
        />
      </Paper>

      {selectedQueueId && (
        <ResponsiveDisplay
          desktopContent={
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <SimpleGrid
                cols={3}
                spacing="lg"
                style={{
                  opacity: isRefreshing ? theme.other.opacity.hover : 1,
                  transition: `opacity ${theme.other.transitions.base}`,
                }}
              >
                <BoardColumn
                  id="opened"
                  title={t("board:columns.opened")}
                  tickets={openedTickets}
                  color="red"
                  onTicketClick={handleTicketClick}
                />

                <BoardColumn
                  id="in-progress"
                  title={t("board:columns.inProgress")}
                  tickets={inProgressTickets}
                  color="blue"
                  onTicketClick={handleTicketClick}
                />

                <BoardColumn
                  id="resolved"
                  title={t("board:columns.resolved")}
                  tickets={resolvedTickets}
                  color="green"
                  onTicketClick={handleTicketClick}
                />
              </SimpleGrid>

              <DragOverlay
                style={{
                  cursor: "grabbing",
                  zIndex: theme.other.zIndex.dragging,
                }}
              >
                {activeId ? (
                  <Paper
                    withBorder
                    shadow="lg"
                    style={{
                      backgroundColor: isDark
                        ? theme.colors.dark[7]
                        : theme.colors.gray[0],
                      borderColor: theme.colors.blue[6],
                      borderWidth: theme.other.spacing[2],
                      transform: "rotate(2deg)",
                      opacity: 0.95,
                    }}
                  >
                    <BoardTicket
                      ticket={tickets.find((t) => t.id === activeId)!}
                    />
                  </Paper>
                ) : null}
              </DragOverlay>
            </DndContext>
          }
          mobileContent={
            <BoardMobile
              queueId={selectedQueueId}
              onTicketClick={handleTicketClick}
            />
          }
        />
      )}

      {draggedTicket && (
        <>
          <AssignUserModal
            opened={assignModalOpen}
            onClose={() => {
              setAssignModalOpen(false);
              setDraggedTicket(null);
            }}
            onAssign={handleAssignUser}
            queueId={selectedQueueId || ""}
          />

          <ClosingNotesModal
            opened={closingNotesModalOpen}
            onClose={() => {
              setClosingNotesModalOpen(false);
              setDraggedTicket(null);
            }}
            onConfirm={handleCloseTicket}
            ticketTitle={draggedTicket.title}
          />
        </>
      )}

      {/* Timeline-style Action Modal */}
      {selectedTicket && isActionModalOpen && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <TicketActionModal
            ticket={selectedTicket}
            opened={isActionModalOpen}
            onClose={handleCloseModal}
          />
        </React.Suspense>
      )}

      {/* Expanded Ticket Modal */}
      <ExpandedTicketModal
        opened={expandedModalOpen}
        onClose={() => {
          setExpandedModalOpen(false);
          setExpandedTicket(null);
        }}
        ticket={expandedTicket}
      />
    </Box>
  );
}
