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
  TextInput,
  Textarea,
} from "@mantine/core";
import { Modal } from "@/components/mantine/feedback/Modal";
import {
  IconCalendar,
  IconCategory,
  IconFlag,
  IconEdit,
  IconCheck,
  IconX,
  IconDeviceFloppy,
  IconArrowsExchange,
  IconRefresh,
  IconProgress,
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
import { useUpdateTicketMutation } from "@/app/[language]/tickets/queries/ticket-queries";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { ReassignQueueModal } from "./ReassignQueueModal";

interface TicketDetailsProps {
  ticket: Ticket;
  historyItems: HistoryItem[];
  onAddComment: (comment: string) => void;
  onAssign: (userId: string) => void;
  onStatusChange: (status: TicketStatus, closingNotes?: string) => void;
  onReassignQueue?: (queueId: string, categoryId: string) => void;
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
  onReassignQueue,
  users,
  categories,
  isLoading,
}: TicketDetailsProps) {
  const { t } = useTranslation("tickets");
  const updateTicketMutation = useUpdateTicketMutation();

  // Editing states
  const [isAssigning, setIsAssigning] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Closing modal states
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState("");

  // Reassign queue modal states
  const [showReassignModal, setShowReassignModal] = useState(false);

  // Field values
  const [selectedUser, setSelectedUser] = useState<string | null>(
    ticket.assignedToId
  );
  const [title, setTitle] = useState(ticket.title);
  const [selectedCategory, setSelectedCategory] = useState(ticket.categoryId);
  const [priority, setPriority] = useState(ticket.priority);
  const [details, setDetails] = useState(ticket.details);

  // Reset field values when ticket changes
  useEffect(() => {
    setSelectedUser(ticket.assignedToId);
    setTitle(ticket.title);
    setSelectedCategory(ticket.categoryId);
    setPriority(ticket.priority);
    setDetails(ticket.details);
  }, [ticket]);

  // Queue users for assignment
  const [queueUsers, setQueueUsers] = useState<{ id: string; name: string }[]>(
    []
  );
  const getQueueService = useGetQueueService();

  // Filter users based on queue assignment
  useEffect(() => {
    const fetchQueueUsers = async () => {
      try {
        const { status, data } = await getQueueService(
          { id: ticket.queueId },
          undefined
        );
        if (status === HTTP_CODES_ENUM.OK && data) {
          const filteredUsers = users.filter((user) =>
            data.assignedUserIds.includes(user.id)
          );
          setQueueUsers(filteredUsers);
        }
      } catch (error) {
        console.error("Error fetching queue details:", error);
        setQueueUsers(users);
      }
    };
    if (ticket?.queueId) {
      fetchQueueUsers();
    }
  }, [ticket.queueId, users, getQueueService]);

  // Save handlers
  const handleSaveTitle = () => {
    if (title.trim() === "") return;

    updateTicketMutation.mutate(
      {
        id: ticket.id,
        data: { title },
      },
      {
        onSuccess: () => {
          setIsEditingTitle(false);
        },
      }
    );
  };

  const handleSaveCategory = () => {
    updateTicketMutation.mutate(
      {
        id: ticket.id,
        data: { categoryId: selectedCategory },
      },
      {
        onSuccess: () => {
          setIsEditingCategory(false);
        },
      }
    );
  };

  const handleSavePriority = () => {
    updateTicketMutation.mutate(
      {
        id: ticket.id,
        data: { priority },
      },
      {
        onSuccess: () => {
          setIsEditingPriority(false);
        },
      }
    );
  };

  const handleSaveDetails = () => {
    if (details.trim() === "") return;

    updateTicketMutation.mutate(
      {
        id: ticket.id,
        data: { details },
      },
      {
        onSuccess: () => {
          setIsEditingDetails(false);
        },
      }
    );
  };

  // Cancel handlers
  const handleCancelTitle = () => {
    setTitle(ticket.title);
    setIsEditingTitle(false);
  };

  const handleCancelCategory = () => {
    setSelectedCategory(ticket.categoryId);
    setIsEditingCategory(false);
  };

  const handleCancelPriority = () => {
    setPriority(ticket.priority);
    setIsEditingPriority(false);
  };

  const handleCancelDetails = () => {
    setDetails(ticket.details);
    setIsEditingDetails(false);
  };

  // Assignment handlers
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

  // Helper functions
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
      [TicketStatus.IN_PROGRESS]: "yellow",
      [TicketStatus.RESOLVED]: "green",
      [TicketStatus.CLOSED]: "gray",
    };
    return (
      <Badge color={colorMap[status]} size="md">
        {status}
      </Badge>
    );
  };

  const priorityOptions = [
    { value: TicketPriority.HIGH, label: t("tickets:tickets.priorities.high") },
    {
      value: TicketPriority.MEDIUM,
      label: t("tickets:tickets.priorities.medium"),
    },
    { value: TicketPriority.LOW, label: t("tickets:tickets.priorities.low") },
  ];

  const handleProgressTicket = () => {
    // Move from OPENED to IN_PROGRESS
    onStatusChange(TicketStatus.IN_PROGRESS);
  };

  const handleResolveTicket = () => {
    // Show modal for resolving notes when resolving
    setShowClosingModal(true);
  };

  const handleCloseResolvedTicket = () => {
    // Close a resolved ticket
    setShowClosingModal(true);
  };

  const handleReopenTicket = () => {
    // Reopen ticket to OPENED status
    onStatusChange(TicketStatus.OPENED);
  };

  const handleCloseTicket = () => {
    // Determine the target status based on current status
    let targetStatus = TicketStatus.RESOLVED;
    if (ticket.status === TicketStatus.RESOLVED) {
      targetStatus = TicketStatus.CLOSED;
    }

    // Pass closing notes along with status change
    onStatusChange(targetStatus, closingNotes || undefined);
    setShowClosingModal(false);
    setClosingNotes("");
  };

  const handleCancelClose = () => {
    setShowClosingModal(false);
    setClosingNotes("");
  };

  // Reassign queue handlers
  const handleReassignQueue = (queueId: string, categoryId: string) => {
    if (onReassignQueue) {
      onReassignQueue(queueId, categoryId);
      setShowReassignModal(false);
    }
  };

  const handleReassignCancel = () => {
    setShowReassignModal(false);
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
          {/* Editable title */}
          {isEditingTitle ? (
            <Group style={{ flex: 1 }}>
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                style={{ flex: 1 }}
                autoFocus
              />
              <ActionIcon color="green" onClick={handleSaveTitle}>
                <IconCheck size={18} />
              </ActionIcon>
              <ActionIcon color="red" onClick={handleCancelTitle}>
                <IconX size={18} />
              </ActionIcon>
            </Group>
          ) : (
            <Group>
              <Title order={4}>
                #{ticket.id.substring(ticket.id.length - 6)}: {ticket.title}
              </Title>
              <ActionIcon
                variant="subtle"
                onClick={() => setIsEditingTitle(true)}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Group>
          )}
          <Group>
            <Button
              variant="light"
              color="blue"
              onClick={() => setShowReassignModal(true)}
              leftSection={<IconArrowsExchange size={16} />}
              size="compact-sm"
              data-testid="change-queue-button"
            >
              {t("tickets:tickets.actions.changeQueue")}
            </Button>
            {/* Status Action Buttons based on current status */}
            {ticket.status === TicketStatus.OPENED && (
              <>
                <Button
                  variant="outline"
                  color="blue"
                  onClick={handleProgressTicket}
                  leftSection={<IconProgress size={16} />}
                  size="compact-sm"
                >
                  {t("tickets:tickets.actions.startProgress")}
                </Button>
                <Button
                  variant="outline"
                  color="green"
                  onClick={handleResolveTicket}
                  leftSection={<IconCheck size={16} />}
                  size="compact-sm"
                >
                  {t("tickets:tickets.actions.resolveTicket")}
                </Button>
              </>
            )}

            {ticket.status === TicketStatus.IN_PROGRESS && (
              <Button
                variant="filled"
                color="green"
                onClick={handleResolveTicket}
                leftSection={<IconCheck size={16} />}
                size="compact-sm"
              >
                {t("tickets:tickets.actions.resolveTicket")}
              </Button>
            )}

            {ticket.status === TicketStatus.RESOLVED && (
              <>
                <Button
                  variant="outline"
                  color="blue"
                  onClick={handleReopenTicket}
                  leftSection={<IconRefresh size={16} />}
                  size="compact-sm"
                >
                  {t("tickets:tickets.actions.reopenTicket")}
                </Button>
                <Button
                  variant="filled"
                  color="red"
                  onClick={handleCloseResolvedTicket}
                  leftSection={<IconX size={16} />}
                  size="compact-sm"
                >
                  {t("tickets:tickets.actions.closeTicket")}
                </Button>
              </>
            )}

            {ticket.status === TicketStatus.CLOSED && (
              <Button
                variant="filled"
                color="blue"
                onClick={handleReopenTicket}
                leftSection={<IconRefresh size={16} />}
                size="compact-sm"
              >
                {t("tickets:tickets.actions.reopenTicket")}
              </Button>
            )}
          </Group>
        </Group>
        <Group mb="md">
          {/* Editable category */}
          <Group gap="xs">
            <IconCategory size={16} />
            {isEditingCategory ? (
              <Group>
                <Select
                  data={categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                  value={selectedCategory}
                  onChange={(value) =>
                    setSelectedCategory(value || ticket.categoryId)
                  }
                  style={{ width: 150 }}
                />
                <ActionIcon color="green" onClick={handleSaveCategory}>
                  <IconCheck size={18} />
                </ActionIcon>
                <ActionIcon color="red" onClick={handleCancelCategory}>
                  <IconX size={18} />
                </ActionIcon>
              </Group>
            ) : (
              <Group>
                <Text size="sm">{getCategoryName(ticket.categoryId)}</Text>
                <ActionIcon
                  variant="subtle"
                  onClick={() => setIsEditingCategory(true)}
                >
                  <IconEdit size={14} />
                </ActionIcon>
              </Group>
            )}
          </Group>

          {/* Editable priority */}
          <Group gap="xs">
            <IconFlag size={16} />
            {isEditingPriority ? (
              <Group>
                <Select
                  data={priorityOptions}
                  value={priority}
                  onChange={(value) => setPriority(value as TicketPriority)}
                  style={{ width: 150 }}
                />
                <ActionIcon color="green" onClick={handleSavePriority}>
                  <IconCheck size={18} />
                </ActionIcon>
                <ActionIcon color="red" onClick={handleCancelPriority}>
                  <IconX size={18} />
                </ActionIcon>
              </Group>
            ) : (
              <Group>
                {renderPriorityBadge(ticket.priority)}
                <ActionIcon
                  variant="subtle"
                  onClick={() => setIsEditingPriority(true)}
                >
                  <IconEdit size={14} />
                </ActionIcon>
              </Group>
            )}
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
          {ticket.closingNotes && (
            <Box>
              <Text fw={500} size="sm" mb="xs">
                {t("tickets:tickets.fields.closingNotes")}
              </Text>
              <Paper p="xs" bg="gray.0" style={{ borderRadius: "4px" }}>
                <Text size="sm">{ticket.closingNotes}</Text>
              </Paper>
            </Box>
          )}
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

        {/* Editable details */}
        {isEditingDetails ? (
          <Box mb="lg">
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.currentTarget.value)}
              minRows={4}
              autosize
              mb="md"
            />
            <Group>
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSaveDetails}
                size="compact-sm"
              >
                {t("common:actions.save")}
              </Button>
              <Button
                variant="light"
                color="red"
                onClick={handleCancelDetails}
                size="compact-sm"
              >
                {t("common:actions.cancel")}
              </Button>
            </Group>
          </Box>
        ) : (
          <Box mb="lg">
            <Group justify="space-between" mb="md">
              <Text>{ticket.details}</Text>
              <ActionIcon
                variant="subtle"
                onClick={() => setIsEditingDetails(true)}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Group>
          </Box>
        )}

        {/* Document section remains unchanged */}
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

      {/* Resolution/Closing Notes Modal */}
      <Modal
        opened={showClosingModal}
        onClose={handleCancelClose}
        title={
          ticket.status === TicketStatus.RESOLVED
            ? t("tickets:tickets.actions.closeTicketModal")
            : t("tickets:tickets.actions.resolveTicketModal")
        }
        centered
        maxWidth="sm"
        actions={[
          <Button
            key="cancel"
            variant="light"
            color="gray"
            onClick={handleCancelClose}
          >
            {t("common:actions.cancel")}
          </Button>,
          <Button
            key="confirm"
            color={ticket.status === TicketStatus.RESOLVED ? "red" : "green"}
            onClick={handleCloseTicket}
          >
            {ticket.status === TicketStatus.RESOLVED
              ? t("tickets:tickets.actions.closeTicket")
              : t("tickets:tickets.actions.resolveTicket")}
          </Button>,
        ]}
      >
        <Stack>
          <Text size="sm" c="dimmed">
            {ticket.status === TicketStatus.RESOLVED
              ? t("tickets:tickets.actions.closeTicketDescription")
              : t("tickets:tickets.actions.resolveTicketDescription")}
          </Text>
          <Textarea
            label={t("tickets:tickets.fields.closingNotes")}
            placeholder={t("tickets:tickets.placeholders.closingNotes")}
            value={closingNotes}
            onChange={(event) => setClosingNotes(event.currentTarget.value)}
            minRows={3}
            maxRows={6}
            autosize
          />
        </Stack>
      </Modal>

      {/* Reassign Queue Modal */}
      <ReassignQueueModal
        opened={showReassignModal}
        onClose={handleReassignCancel}
        onConfirm={handleReassignQueue}
        currentQueueId={ticket.queueId}
        currentCategoryId={ticket.categoryId}
        isSubmitting={false}
      />
    </Stack>
  );
}
