"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  LoadingOverlay,
  Center,
  Text,
  Tabs,
  Stack,
  Group,
  Badge,
  Button,
  ActionIcon,
  ScrollArea,
  Menu,
} from "@mantine/core";
import {
  IconUserCheck,
  IconCheck,
  IconArrowsExchange,
  IconDots,
  IconPlayerPlay,
  IconX,
} from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { AssignUserModal } from "./AssignUserModal";
import { ClosingNotesModal } from "./ClosingNotesModal";
import {
  useGetTicketsService,
  useAssignTicketService,
  useUpdateTicketStatusService,
  useUpdateTicketService,
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
  closingNotes: string | null;
  createdById: string;
  details: string;
  category?: { id: string; name: string };
  queue?: { id: string; name: string };
}

interface BoardMobileProps {
  queueId: string;
  onTicketClick?: (ticket: Ticket) => void;
}

export function BoardMobile({ queueId, onTicketClick }: BoardMobileProps) {
  const { t } = useTranslation("board");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("opened");

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [closingModalOpen, setClosingModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // API Services
  const getTicketsService = useGetTicketsService();
  const assignTicketService = useAssignTicketService();
  const updateTicketStatusService = useUpdateTicketStatusService();
  const updateTicketService = useUpdateTicketService();

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    const loadingState = tickets.length === 0 ? setIsLoading : setIsRefreshing;
    loadingState(true);

    try {
      const { status, data } = await getTicketsService(undefined, {
        page: 1,
        limit: 1000,
        queueId,
      });

      if (status === HTTP_CODES_ENUM.OK) {
        const ticketsArray = Array.isArray(data) ? data : data.data || [];

        // Filter tickets for board view
        const filteredTickets = ticketsArray.filter(
          (ticket: Ticket) =>
            ticket.status === "Opened" ||
            ticket.status === "In Progress" ||
            ticket.status === "Resolved"
        );

        setTickets(filteredTickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } finally {
      loadingState(false);
    }
  }, [queueId, getTicketsService, tickets.length]);

  useEffect(() => {
    if (queueId) {
      fetchTickets();
    }
  }, [queueId, fetchTickets]);

  // Group tickets by status
  const ticketsByStatus = {
    opened: tickets.filter((t) => t.status === "Opened"),
    inProgress: tickets.filter((t) => t.status === "In Progress"),
    resolved: tickets.filter((t) => t.status === "Resolved"),
  };

  // Handle ticket actions
  const handleAssignTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssignModalOpen(true);
  };

  const handleResolveTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setClosingModalOpen(true);
  };

  const handleStartProgress = async (ticket: Ticket) => {
    try {
      const { status } = await updateTicketStatusService(
        { status: TicketStatus.IN_PROGRESS },
        { id: ticket.id }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        await fetchTickets();
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleUnassignTicket = async (ticket: Ticket) => {
    try {
      const { status } = await updateTicketService(
        { assignedToId: null },
        { id: ticket.id }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        await fetchTickets();
      }
    } catch (error) {
      console.error("Error unassigning ticket:", error);
    }
  };

  // Modal handlers
  const handleAssignUser = async (userId: string) => {
    if (!selectedTicket) return;

    try {
      const { status } = await assignTicketService(
        { userId: userId },
        { id: selectedTicket.id }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        await fetchTickets();
        setAssignModalOpen(false);
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
    }
  };

  const handleCloseTicket = async (closingNotes: string) => {
    if (!selectedTicket) return;

    try {
      // Determine target status based on current status
      let targetStatus = TicketStatus.RESOLVED;
      if (selectedTicket.status === "Resolved") {
        targetStatus = TicketStatus.CLOSED;
      }

      const { status } = await updateTicketStatusService(
        { status: targetStatus, closingNotes },
        { id: selectedTicket.id }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        await fetchTickets();
        setClosingModalOpen(false);
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "opened":
        return "red";
      case "inProgress":
        return "yellow";
      case "resolved":
        return "green";
      default:
        return "gray";
    }
  };

  // Render ticket actions
  const renderTicketActions = (ticket: Ticket) => {
    const actions = [];

    if (ticket.status === "Opened") {
      if (!ticket.assignedToId) {
        actions.push(
          <Button
            key="assign"
            leftSection={<IconUserCheck size={16} />}
            variant="light"
            color="blue"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              handleAssignTicket(ticket);
            }}
          >
            Assign
          </Button>
        );
      } else {
        actions.push(
          <Button
            key="progress"
            leftSection={<IconPlayerPlay size={16} />}
            variant="light"
            color="yellow"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              handleStartProgress(ticket);
            }}
          >
            Start Progress
          </Button>
        );
      }
    }

    if (ticket.status === "In Progress") {
      actions.push(
        <Button
          key="resolve"
          leftSection={<IconCheck size={16} />}
          variant="light"
          color="green"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            handleResolveTicket(ticket);
          }}
        >
          Resolve
        </Button>
      );
    }

    if (ticket.status === "Resolved") {
      actions.push(
        <Button
          key="close"
          leftSection={<IconX size={16} />}
          variant="light"
          color="red"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTicket(ticket);
            setClosingModalOpen(true);
          }}
        >
          Close
        </Button>
      );
    }

    // More actions menu - always show for additional actions
    if (ticket.status !== "Closed") {
      actions.push(
        <Menu key="more" position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="light"
              color="gray"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {ticket.assignedToId && (
              <Menu.Item
                leftSection={<IconArrowsExchange size={16} />}
                onClick={() => handleUnassignTicket(ticket)}
              >
                Unassign
              </Menu.Item>
            )}
            <Menu.Item
              leftSection={<IconUserCheck size={16} />}
              onClick={() => handleAssignTicket(ticket)}
            >
              {ticket.assignedToId ? "Reassign" : "Assign"}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      );
    }

    return actions;
  };

  // Render ticket card
  const renderTicketCard = (ticket: Ticket) => (
    <Paper
      key={ticket.id}
      p="md"
      withBorder
      shadow="sm"
      onClick={() => onTicketClick?.(ticket)}
      style={{ cursor: "pointer" }}
    >
      <Stack gap="sm">
        {/* Ticket Header */}
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

        {/* Title */}
        <Text fw={500} size="sm" lineClamp={2}>
          {ticket.title}
        </Text>

        {/* Badges */}
        <Group gap="xs">
          <Badge
            size="xs"
            color={
              ticket.priority === "HIGH"
                ? "red"
                : ticket.priority === "MEDIUM"
                  ? "yellow"
                  : "green"
            }
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

        {/* Actions */}
        <Group gap="xs" wrap="nowrap">
          {renderTicketActions(ticket)}
        </Group>
      </Stack>
    </Paper>
  );

  if (isLoading) {
    return (
      <Paper p="xl" withBorder h={400} pos="relative">
        <LoadingOverlay visible />
        <Center h="100%">
          <Text>{t("board:loading.tickets")}</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || "opened")}
      >
        <Tabs.List grow>
          <Tabs.Tab
            value="opened"
            rightSection={
              <Badge size="sm" color={getStatusColor("opened")} variant="light">
                {ticketsByStatus.opened.length}
              </Badge>
            }
          >
            Opened
          </Tabs.Tab>
          <Tabs.Tab
            value="inProgress"
            rightSection={
              <Badge
                size="sm"
                color={getStatusColor("inProgress")}
                variant="light"
              >
                {ticketsByStatus.inProgress.length}
              </Badge>
            }
          >
            In Progress
          </Tabs.Tab>
          <Tabs.Tab
            value="resolved"
            rightSection={
              <Badge
                size="sm"
                color={getStatusColor("resolved")}
                variant="light"
              >
                {ticketsByStatus.resolved.length}
              </Badge>
            }
          >
            Resolved
          </Tabs.Tab>
        </Tabs.List>

        <Box pos="relative">
          {isRefreshing && <LoadingOverlay visible zIndex={100} />}

          <Tabs.Panel value="opened" pt="md">
            <ScrollArea style={{ height: "calc(100vh - 250px)" }}>
              <Stack gap="sm" p="md">
                {ticketsByStatus.opened.length > 0 ? (
                  ticketsByStatus.opened.map(renderTicketCard)
                ) : (
                  <Center py="xl">
                    <Text c="dimmed">No opened tickets</Text>
                  </Center>
                )}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="inProgress" pt="md">
            <ScrollArea style={{ height: "calc(100vh - 250px)" }}>
              <Stack gap="sm" p="md">
                {ticketsByStatus.inProgress.length > 0 ? (
                  ticketsByStatus.inProgress.map(renderTicketCard)
                ) : (
                  <Center py="xl">
                    <Text c="dimmed">No tickets in progress</Text>
                  </Center>
                )}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="resolved" pt="md">
            <ScrollArea style={{ height: "calc(100vh - 250px)" }}>
              <Stack gap="sm" p="md">
                {ticketsByStatus.resolved.length > 0 ? (
                  ticketsByStatus.resolved.map(renderTicketCard)
                ) : (
                  <Center py="xl">
                    <Text c="dimmed">No resolved tickets</Text>
                  </Center>
                )}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>
        </Box>
      </Tabs>

      {/* Modals */}
      <AssignUserModal
        opened={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedTicket(null);
        }}
        onAssign={handleAssignUser}
        queueId={queueId}
      />

      <ClosingNotesModal
        opened={closingModalOpen}
        onClose={() => {
          setClosingModalOpen(false);
          setSelectedTicket(null);
        }}
        onConfirm={handleCloseTicket}
        ticketTitle={selectedTicket?.title || ""}
      />
    </Box>
  );
}
