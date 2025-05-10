// src/components/tickets/TicketDetails.tsx
import React, { useState, useEffect } from "react";
import {
  Group,
  Text,
  Badge,
  Button,
  Box,
  Title,
  Divider,
  Paper,
  ActionIcon,
  Stack,
  Select,
} from "@mantine/core";
import {
  IconCalendar,
  IconCategory,
  IconFlag,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "@/services/api/services/tickets";
import { HistoryItem } from "@/services/api/services/history-items";
import { formatDate } from "@/utils/format-date";
import { TicketTimeline } from "./TicketTimeline";
import { CommentBox } from "./CommentBox";
import TicketDocumentsSection from "./documents/TicketDocumentsSection";
import { useGetQueueService } from "@/app/[language]/tickets/queries/queue-queries";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

interface TicketDetailsProps {
  ticket: Ticket;
  historyItems: HistoryItem[];
  onAddComment: (comment: string) => void;
  onAssign: (userId: string) => void;
  onStatusChange: (status: TicketStatus) => void;
  onEditTicket: () => void;
  users: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  isLoading: boolean;
}

export function TicketDetails({
  ticket,
  historyItems,
  onAddComment,
  onAssign,
  onStatusChange,
  onEditTicket,
  users,
  categories,
  isLoading,
}: TicketDetailsProps) {
  const { t } = useTranslation("tickets");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(
    ticket.assignedToId
  );
  // Add state for queue-filtered users
  const [queueUsers, setQueueUsers] = useState<{ id: string; name: string }[]>(
    []
  );

  // Get queue service to fetch queue details
  const getQueueService = useGetQueueService();

  // Filter users based on queue assignment
  useEffect(() => {
    const fetchQueueUsers = async () => {
      try {
        // First get the queue details to access assignedUserIds
        const { status, data } = await getQueueService(
          { id: ticket.queueId },
          undefined
        );

        if (status === HTTP_CODES_ENUM.OK && data) {
          // Filter users to only include those assigned to this queue
          const filteredUsers = users.filter((user) =>
            data.assignedUserIds.includes(user.id)
          );

          setQueueUsers(filteredUsers);
        }
      } catch (error) {
        console.error("Error fetching queue details:", error);
        // Fallback to all users if there's an error
        setQueueUsers(users);
      }
    };

    if (ticket?.queueId) {
      fetchQueueUsers();
    }
  }, [ticket.queueId, users, getQueueService]);

  const handleAssignSubmit = () => {
    if (selectedUser) {
      onAssign(selectedUser);
      setIsAssigning(false);
    }
  };

  const handleAssignCancel = () => {
    setSelectedUser(ticket.assignedToId);
    setIsAssigning(false);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

  const renderPriorityBadge = (priority: TicketPriority) => {
    const colorMap: Record<TicketPriority, string> = {
      [TicketPriority.HIGH]: "red",
      [TicketPriority.MEDIUM]: "yellow",
      [TicketPriority.LOW]: "green",
    };
    return (
      <Badge color={colorMap[priority]} size="md">
        {priority}
      </Badge>
    );
  };

  const renderStatusBadge = (status: TicketStatus) => {
    const colorMap: Record<TicketStatus, string> = {
      [TicketStatus.OPENED]: "blue",
      [TicketStatus.CLOSED]: "gray",
    };
    return (
      <Badge color={colorMap[status]} size="md">
        {status}
      </Badge>
    );
  };

  const toggleStatus = () => {
    const newStatus =
      ticket.status === TicketStatus.OPENED
        ? TicketStatus.CLOSED
        : TicketStatus.OPENED;
    onStatusChange(newStatus);
  };

  if (isLoading) {
    return (
      <Paper withBorder p="xl">
        <Text ta="center">{t("common:loading")}</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder p="md">
        <Group justify="apart" mb="xs">
          <Group>
            <Title order={4}>
              #{ticket.id.substring(ticket.id.length - 6)}: {ticket.title}
            </Title>
          </Group>
          <Group>
            <Button
              variant={
                ticket.status === TicketStatus.OPENED ? "outline" : "filled"
              }
              color={ticket.status === TicketStatus.OPENED ? "red" : "blue"}
              onClick={toggleStatus}
              leftSection={
                ticket.status === TicketStatus.OPENED ? (
                  <IconX size={16} />
                ) : (
                  <IconCheck size={16} />
                )
              }
              size="compact-sm"
            >
              {ticket.status === TicketStatus.OPENED
                ? t("tickets:tickets.actions.closeTicket")
                : t("tickets:tickets.actions.reopenTicket")}
            </Button>
            <Button
              variant="light"
              onClick={onEditTicket}
              leftSection={<IconEdit size={16} />}
              size="compact-sm"
            >
              {t("tickets:tickets.actions.editTicket")}
            </Button>
          </Group>
        </Group>
        <Group mb="md">
          <Group gap="xs">
            <IconCategory size={16} />
            <Text size="sm">{getCategoryName(ticket.categoryId)}</Text>
          </Group>
          <Group gap="xs">
            <IconFlag size={16} />
            {renderPriorityBadge(ticket.priority)}
          </Group>
          <Group gap="xs">
            <IconCalendar size={16} />
            <Text size="sm">{formatDate(new Date(ticket.createdAt))}</Text>
          </Group>
        </Group>
        <Divider mb="md" />
        <Group align="flex-start" mb="md">
          <Box>
            <Text fw={500} size="sm" mb="xs">
              {t("tickets:tickets.fields.status")}
            </Text>
            {renderStatusBadge(ticket.status)}
          </Box>
          <Box>
            <Text fw={500} size="sm" mb="xs">
              {t("tickets:tickets.fields.assignedTo")}
            </Text>
            {isAssigning ? (
              <Group>
                <Select
                  placeholder={t("tickets:tickets.actions.selectUser")}
                  data={queueUsers.map((user) => ({
                    value: user.id,
                    label: user.name,
                  }))}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  searchable
                  w={200}
                  nothingFoundMessage={t("tickets:tickets.noQueueUsers")}
                />
                <ActionIcon
                  variant="filled"
                  color="green"
                  onClick={handleAssignSubmit}
                  disabled={!selectedUser}
                >
                  <IconCheck size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="filled"
                  color="red"
                  onClick={handleAssignCancel}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            ) : (
              <Group>
                {ticket.assignedToId ? (
                  <Badge>{getUserName(ticket.assignedToId)}</Badge>
                ) : (
                  <Badge color="gray">{t("tickets:tickets.notAssigned")}</Badge>
                )}
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => setIsAssigning(true)}
                >
                  {ticket.assignedToId
                    ? t("tickets:tickets.actions.reassign")
                    : t("tickets:tickets.actions.assign")}
                </Button>
              </Group>
            )}
          </Box>
          <Box>
            <Text fw={500} size="sm" mb="xs">
              {t("tickets:tickets.fields.createdBy")}
            </Text>
            <Badge>{getUserName(ticket.createdById)}</Badge>
          </Box>
        </Group>
        <Divider
          mb="md"
          label={t("tickets:tickets.fields.details")}
          labelPosition="left"
        />
        <Text mb="lg">{ticket.details}</Text>

        {/* Use our new TicketDocumentsSection component here */}
        <TicketDocumentsSection ticketId={ticket.id} />
      </Paper>

      <Paper withBorder p="md">
        <Title order={5} mb="md">
          {t("tickets:tickets.timeline")}
        </Title>
        <TicketTimeline historyItems={historyItems} users={users} />
        <Divider my="md" />
        <CommentBox onSubmit={onAddComment} />
      </Paper>
    </Stack>
  );
}
