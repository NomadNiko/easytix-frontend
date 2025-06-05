"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Title,
  Divider,
  ScrollArea,
  Box,
  Timeline,
  Loader,
  Center,
  Button,
  Textarea,
  Select,
} from "@mantine/core";
import {
  IconUser,
  IconCalendar,
  IconFlag,
  IconCategory,
  IconMessage,
  IconStatusChange,
  IconUserPlus,
  IconFile,
  IconUserX,
  IconSend,
  IconCheck,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { formatDate } from "@/utils/format-date";
import {
  TicketStatus,
  TicketPriority,
  useUpdateTicketStatusService,
  useAssignTicketService,
  useUpdateTicketService,
} from "@/services/api/services/tickets";
import {
  useGetHistoryItemsByTicketService,
  useCreateHistoryItemService,
  HistoryItemType,
} from "@/services/api/services/history-items";
import { useGetUserService } from "@/services/api/services/users";
import { useGetQueueService } from "@/services/api/services/queues";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { notifications } from "@mantine/notifications";

interface Ticket {
  id: string;
  title: string;
  details: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  queueId: string;
  categoryId: string;
  createdAt: string;
  closedAt: string | null;
  closingNotes: string | null;
  createdById: string;
  category?: { id: string; name: string };
  queue?: { id: string; name: string };
}

interface ExpandedTicketModalProps {
  opened: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onTicketUpdate?: () => void; // Callback to refresh board data
}

interface HistoryItem {
  id: string;
  ticketId: string;
  userId: string;
  type: string;
  details: string;
  createdAt: string;
}

import { User } from "@/services/api/types/user";

export function ExpandedTicketModal({
  opened,
  onClose,
  ticket,
  onTicketUpdate,
}: ExpandedTicketModalProps) {
  const { t } = useTranslation("board");
  const tTickets = useTranslation("tickets").t;
  const tCommon = useTranslation("common").t;
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [queueUsers, setQueueUsers] = useState<User[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [creator, setCreator] = useState<User | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(ticket);

  // Action states
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showClosingNotes, setShowClosingNotes] = useState(false);
  const [closingNotes, setClosingNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Services
  const getHistoryItemsByTicketService = useGetHistoryItemsByTicketService();
  const createHistoryItemService = useCreateHistoryItemService();
  const getUserService = useGetUserService();
  const getQueueService = useGetQueueService();
  const updateTicketStatusService = useUpdateTicketStatusService();
  const assignTicketService = useAssignTicketService();
  const updateTicketService = useUpdateTicketService();

  // Update current ticket when prop changes
  useEffect(() => {
    setCurrentTicket(ticket);
    setSelectedAssignee(ticket?.assignedToId || null);
  }, [ticket]);

  // Fetch history and users
  useEffect(() => {
    const fetchHistoryAndUsers = async () => {
      if (!currentTicket) return;

      setIsLoadingHistory(true);
      try {
        // Fetch history items
        const historyResponse = await getHistoryItemsByTicketService({
          ticketId: currentTicket.id,
        });

        if (historyResponse.status === HTTP_CODES_ENUM.OK) {
          const historyData = historyResponse.data || [];
          setHistoryItems(historyData);

          // Get unique user IDs
          const userIds = Array.from(
            new Set<string>([
              currentTicket.createdById,
              ...historyData.map((item) => item.userId),
            ])
          );

          // Fetch user details
          const userMap: Record<string, User> = {};
          for (const userId of userIds) {
            if (userId && userId !== "system") {
              try {
                const userResponse = await getUserService({ id: userId });
                if (
                  userResponse.status === HTTP_CODES_ENUM.OK &&
                  userResponse.data
                ) {
                  userMap[userId] = userResponse.data;
                }
              } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
              }
            }
          }
          setUsers(userMap);

          // Set creator
          if (currentTicket.createdById && userMap[currentTicket.createdById]) {
            setCreator(userMap[currentTicket.createdById]);
          }
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    // Fetch queue and assigned users for assignment
    const fetchQueueAndUsers = async () => {
      if (!currentTicket?.queueId) return;

      setIsLoadingUsers(true);
      try {
        const queueResponse = await getQueueService({
          id: currentTicket.queueId,
        });
        if (queueResponse.status === HTTP_CODES_ENUM.OK && queueResponse.data) {
          const queue = queueResponse.data;

          // Fetch users who are assigned to this queue
          const assignedUsers = [];
          for (const userId of queue.assignedUserIds || []) {
            try {
              const userResponse = await getUserService({ id: userId });
              if (
                userResponse.status === HTTP_CODES_ENUM.OK &&
                userResponse.data
              ) {
                assignedUsers.push(userResponse.data);
              }
            } catch (error) {
              console.error(`Error fetching user ${userId}:`, error);
            }
          }
          setQueueUsers(assignedUsers);
        }
      } catch (error) {
        console.error("Error fetching queue:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (opened && currentTicket) {
      fetchHistoryAndUsers();
      fetchQueueAndUsers();
    }
  }, [
    opened,
    currentTicket,
    getHistoryItemsByTicketService,
    getUserService,
    getQueueService,
  ]);

  // Action handlers
  const handleAddComment = async () => {
    if (!currentTicket || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await createHistoryItemService({
        ticketId: currentTicket.id,
        type: HistoryItemType.COMMENT,
        details: newComment.trim(),
      });

      if (response.status === HTTP_CODES_ENUM.CREATED) {
        notifications.show({
          title: t("modal.notifications.comment.success.title"),
          message: t("modal.notifications.comment.success.message"),
          color: "green",
        });

        // Refresh history
        const historyResponse = await getHistoryItemsByTicketService({
          ticketId: currentTicket.id,
        });
        if (historyResponse.status === HTTP_CODES_ENUM.OK) {
          setHistoryItems(historyResponse.data || []);
        }

        setNewComment("");
        setShowCommentForm(false);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      notifications.show({
        title: tCommon("error"),
        message: t("modal.notifications.comment.error.message"),
        color: "red",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAssignTicket = async () => {
    if (!currentTicket || !selectedAssignee) return;

    setIsAssigning(true);
    try {
      const response = await assignTicketService(
        { userId: selectedAssignee },
        { id: currentTicket.id }
      );

      if (response.status === HTTP_CODES_ENUM.OK && response.data) {
        notifications.show({
          title: t("modal.notifications.assign.success.title"),
          message: t("modal.notifications.assign.success.message"),
          color: "green",
        });

        setCurrentTicket(response.data);
        onTicketUpdate?.();

        // Refresh history
        const historyResponse = await getHistoryItemsByTicketService({
          ticketId: currentTicket.id,
        });
        if (historyResponse.status === HTTP_CODES_ENUM.OK) {
          setHistoryItems(historyResponse.data || []);
        }
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
      notifications.show({
        title: tCommon("error"),
        message: t("modal.notifications.assign.error.message"),
        color: "red",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignTicket = async () => {
    if (!currentTicket) return;

    setIsAssigning(true);
    try {
      const response = await updateTicketService(
        { assignedToId: null },
        { id: currentTicket.id }
      );

      if (response.status === HTTP_CODES_ENUM.OK && response.data) {
        notifications.show({
          title: t("modal.notifications.unassign.success.title"),
          message: t("modal.notifications.unassign.success.message"),
          color: "green",
        });

        setCurrentTicket(response.data);
        setSelectedAssignee(null);
        onTicketUpdate?.();

        // Refresh history
        const historyResponse = await getHistoryItemsByTicketService({
          ticketId: currentTicket.id,
        });
        if (historyResponse.status === HTTP_CODES_ENUM.OK) {
          setHistoryItems(historyResponse.data || []);
        }
      }
    } catch (error) {
      console.error("Error unassigning ticket:", error);
      notifications.show({
        title: tCommon("error"),
        message: t("modal.notifications.unassign.error.message"),
        color: "red",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusChange = async (
    newStatus: TicketStatus,
    notes?: string
  ) => {
    if (!currentTicket) return;

    setIsUpdatingStatus(true);
    try {
      const payload: { status: TicketStatus; closingNotes?: string } = {
        status: newStatus,
      };
      if (notes) {
        payload.closingNotes = notes;
      }

      const response = await updateTicketStatusService(payload, {
        id: currentTicket.id,
      });

      if (response.status === HTTP_CODES_ENUM.OK && response.data) {
        notifications.show({
          title: t("modal.notifications.status.success.title"),
          message: t("modal.notifications.status.success.message"),
          color: "green",
        });

        setCurrentTicket(response.data);
        setShowClosingNotes(false);
        setClosingNotes("");
        onTicketUpdate?.();

        // Refresh history
        const historyResponse = await getHistoryItemsByTicketService({
          ticketId: currentTicket.id,
        });
        if (historyResponse.status === HTTP_CODES_ENUM.OK) {
          setHistoryItems(historyResponse.data || []);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      notifications.show({
        title: tCommon("error"),
        message: t("modal.notifications.status.error.message"),
        color: "red",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getUserName = (userId: string) => {
    if (userId === "system") return "System";
    const user = users[userId];
    return user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
      : userId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TicketStatus.OPENED:
        return "blue";
      case TicketStatus.IN_PROGRESS:
        return "yellow";
      case TicketStatus.RESOLVED:
        return "green";
      case TicketStatus.CLOSED:
        return "gray";
      default:
        return "gray";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TicketPriority.HIGH:
        return "red";
      case TicketPriority.MEDIUM:
        return "yellow";
      case TicketPriority.LOW:
        return "green";
      default:
        return "gray";
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case "COMMENT":
        return <IconMessage size={16} />;
      case "ASSIGNED":
      case "UNASSIGNED":
        return <IconUserPlus size={16} />;
      case "STATUS_CHANGED":
      case "CLOSED":
      case "REOPENED":
        return <IconStatusChange size={16} />;
      case "DOCUMENT_ADDED":
      case "DOCUMENT_REMOVED":
        return <IconFile size={16} />;
      default:
        return <IconMessage size={16} />;
    }
  };

  if (!currentTicket) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Text size="sm" c="dimmed">
            #{currentTicket.id.slice(-6)}
          </Text>
          <Badge
            color={getStatusColor(currentTicket.status)}
            variant="filled"
            size="sm"
          >
            {tTickets(`tickets.statuses.${currentTicket.status}`)}
          </Badge>
        </Group>
      }
      size="xl"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      styles={{
        content: {
          height: "95vh",
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
        },
        body: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "0",
        },
      }}
    >
      <ScrollArea
        style={{ flex: 1, height: "100%" }}
        offsetScrollbars
        scrollbarSize={6}
        type="auto"
      >
        <Stack gap="md" p="md">
          {/* Header */}
          <Box>
            <Title order={3} mb="md">
              {currentTicket.title}
            </Title>

            <Stack gap="sm">
              <Group gap="md" wrap="wrap">
                <Group gap="xs">
                  <IconFlag size={16} />
                  <Badge
                    color={getPriorityColor(currentTicket.priority)}
                    variant="filled"
                    size="sm"
                  >
                    {tTickets(`tickets.priorities.${currentTicket.priority}`)}
                  </Badge>
                </Group>

                {currentTicket.category && (
                  <Group gap="xs">
                    <IconCategory size={16} />
                    <Text size="sm">{currentTicket.category.name}</Text>
                  </Group>
                )}
              </Group>

              <Stack gap="xs">
                <Group gap="xs">
                  <IconUser size={16} />
                  <Text size="sm">
                    {creator
                      ? `${creator.firstName || ""} ${creator.lastName || ""}`.trim() ||
                        creator.email
                      : tCommon("unknown")}
                  </Text>
                </Group>

                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text size="sm">
                    {formatDate(new Date(currentTicket.createdAt))}
                  </Text>
                </Group>
              </Stack>
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Box>
            <Stack gap="xs">
              <Button
                fullWidth
                leftSection={<IconMessage size={16} />}
                variant="light"
                color="blue"
                onClick={() => setShowCommentForm(!showCommentForm)}
                size="sm"
                styles={{
                  label: { fontSize: "11px" },
                }}
              >
                {t("modal.actions.addComment")}
              </Button>

              {currentTicket.assignedToId ? (
                <Button
                  fullWidth
                  leftSection={<IconUserX size={16} />}
                  variant="light"
                  color="orange"
                  onClick={handleUnassignTicket}
                  loading={isAssigning}
                  size="sm"
                  styles={{
                    label: { fontSize: "11px" },
                  }}
                >
                  {t("modal.actions.unassign")}
                </Button>
              ) : (
                <Button
                  fullWidth
                  leftSection={<IconUserPlus size={16} />}
                  variant="light"
                  color="green"
                  onClick={handleAssignTicket}
                  loading={isAssigning}
                  disabled={!selectedAssignee}
                  size="sm"
                  styles={{
                    label: { fontSize: "11px" },
                  }}
                >
                  {t("modal.actions.assign")}
                </Button>
              )}

              {currentTicket.status === TicketStatus.OPENED ||
              currentTicket.status === TicketStatus.IN_PROGRESS ? (
                <Button
                  fullWidth
                  leftSection={<IconCheck size={16} />}
                  variant="light"
                  color="green"
                  onClick={() => setShowClosingNotes(true)}
                  loading={isUpdatingStatus}
                  size="sm"
                  styles={{
                    label: { fontSize: "11px" },
                  }}
                >
                  {t("modal.actions.resolve")}
                </Button>
              ) : currentTicket.status === TicketStatus.RESOLVED ? (
                <Button
                  fullWidth
                  leftSection={<IconX size={16} />}
                  variant="light"
                  color="gray"
                  onClick={() => handleStatusChange(TicketStatus.CLOSED)}
                  loading={isUpdatingStatus}
                  size="sm"
                  styles={{
                    label: { fontSize: "11px" },
                  }}
                >
                  {t("modal.actions.close")}
                </Button>
              ) : (
                <Button
                  fullWidth
                  leftSection={<IconRefresh size={16} />}
                  variant="light"
                  color="blue"
                  onClick={() => handleStatusChange(TicketStatus.OPENED)}
                  loading={isUpdatingStatus}
                  size="sm"
                  styles={{
                    label: { fontSize: "11px" },
                  }}
                >
                  {t("modal.actions.reopen")}
                </Button>
              )}
            </Stack>
          </Box>

          {/* Assignment Section */}
          {!currentTicket.assignedToId && (
            <Box>
              <Select
                label={t("modal.assignTo.label")}
                placeholder={
                  isLoadingUsers
                    ? tCommon("loading")
                    : t("modal.assignTo.placeholder")
                }
                data={queueUsers.map((user) => ({
                  value: user.id,
                  label:
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    user.email,
                }))}
                value={selectedAssignee}
                onChange={setSelectedAssignee}
                searchable
                disabled={isLoadingUsers}
                size="sm"
              />
            </Box>
          )}

          {/* Comment Form */}
          {showCommentForm && (
            <Box>
              <Stack gap="sm">
                <Textarea
                  label={t("modal.comment.label")}
                  placeholder={t("modal.comment.placeholder")}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  minRows={3}
                  maxRows={6}
                  size="sm"
                />
                <Group justify="flex-end">
                  <Button
                    variant="subtle"
                    onClick={() => {
                      setShowCommentForm(false);
                      setNewComment("");
                    }}
                    size="sm"
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    leftSection={<IconSend size={16} />}
                    onClick={handleAddComment}
                    loading={isSubmittingComment}
                    disabled={!newComment.trim()}
                    size="sm"
                  >
                    {t("modal.comment.send")}
                  </Button>
                </Group>
              </Stack>
            </Box>
          )}

          {/* Closing Notes Form */}
          {showClosingNotes && (
            <Box>
              <Stack gap="sm">
                <Textarea
                  label={t("modal.closingNotes.label")}
                  placeholder={t("modal.closingNotes.placeholder")}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  minRows={3}
                  maxRows={6}
                  size="sm"
                />
                <Group justify="flex-end">
                  <Button
                    variant="subtle"
                    onClick={() => {
                      setShowClosingNotes(false);
                      setClosingNotes("");
                    }}
                    size="sm"
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    leftSection={<IconCheck size={16} />}
                    onClick={() =>
                      handleStatusChange(TicketStatus.RESOLVED, closingNotes)
                    }
                    loading={isUpdatingStatus}
                    color="green"
                    size="sm"
                  >
                    {t("modal.actions.resolve")}
                  </Button>
                </Group>
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Details */}
          <Box>
            <Text fw={600} size="sm" mb="xs">
              {t("modal.details.title")}
            </Text>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {currentTicket.details}
            </Text>
          </Box>

          {currentTicket.closingNotes && (
            <>
              <Divider />
              <Box>
                <Text fw={600} size="sm" mb="xs">
                  {t("modal.closingNotes.title")}
                </Text>
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {currentTicket.closingNotes}
                </Text>
              </Box>
            </>
          )}

          <Divider />

          {/* History Timeline */}
          <Box>
            <Text fw={600} size="sm" mb="md">
              {t("modal.timeline.title")}
            </Text>

            {isLoadingHistory ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : (
              <Box style={{ maxHeight: "250px", overflowY: "auto" }}>
                <Timeline
                  active={historyItems.length}
                  bulletSize={20}
                  lineWidth={2}
                >
                  {historyItems.map((item) => (
                    <Timeline.Item
                      key={item.id}
                      bullet={getHistoryIcon(item.type)}
                      title={
                        <Group gap="xs">
                          <Text size="sm" fw={500}>
                            {getUserName(item.userId)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDate(new Date(item.createdAt))}
                          </Text>
                        </Group>
                      }
                    >
                      <Text size="sm" c="dimmed">
                        {item.details}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Box>
            )}
          </Box>
        </Stack>
      </ScrollArea>
    </Modal>
  );
}
