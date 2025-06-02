"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Group,
  Button,
  Text,
  Badge,
  Divider,
  Paper,
  Timeline,
  Loader,
  Center,
  ScrollArea,
} from "@mantine/core";
import {
  IconMessagePlus,
  IconUserCheck,
  IconArrowsExchange,
  IconLock,
  IconLockOpen,
  IconEye,
  IconCalendar,
  IconMessage,
  IconStatusChange,
  IconUserPlus,
  IconFile,
  IconCheck,
} from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";
import { CommentBox } from "@/components/tickets/CommentBox";
import { ReassignQueueModal } from "@/components/tickets/ReassignQueueModal";
import { useGetHistoryItemsByTicketService } from "@/services/api/services/history-items";
import { useGetUserService } from "@/services/api/services/users";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { User } from "@/services/api/types/user";
import {
  useUpdateTicketStatusService,
  TicketStatus,
} from "@/services/api/services/tickets";
import { Modal as ClosingModal } from "@/components/mantine/feedback/Modal";
import { Textarea } from "@mantine/core";

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
  category?: { id: string; name: string };
  queue?: { id: string; name: string };
}

interface HistoryItem {
  id: string;
  ticketId: string;
  userId: string;
  type: string;
  details: string;
  createdAt: string;
}

interface TicketActionModalProps {
  ticket: Ticket;
  opened: boolean;
  onClose: () => void;
}

export function TicketActionModal({
  ticket,
  opened,
  onClose,
}: TicketActionModalProps) {
  const { t } = useTranslation("timeline");
  const router = useRouter();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState("");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const getHistoryItemsByTicketService = useGetHistoryItemsByTicketService();
  const getUserService = useGetUserService();
  const updateTicketStatusService = useUpdateTicketStatusService();

  // Fetch ticket history when modal opens
  useEffect(() => {
    const fetchHistoryAndUsers = async () => {
      if (!opened || !ticket) return;

      setIsLoadingHistory(true);
      try {
        // Fetch history items
        const historyResponse = await getHistoryItemsByTicketService({
          ticketId: ticket.id,
        });

        if (historyResponse.status === HTTP_CODES_ENUM.OK) {
          const historyData = historyResponse.data || [];
          // Take only the last 3 entries
          const recentHistory = historyData.slice(-3);
          setHistoryItems(recentHistory);

          // Get unique user IDs
          const userIds = Array.from(
            new Set<string>(recentHistory.map((item) => item.userId))
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
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoryAndUsers();
  }, [opened, ticket, getHistoryItemsByTicketService, getUserService]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const handleViewTicket = () => {
    router.push(`/tickets/${ticket.id}`);
    onClose();
  };

  const handleAddComment = () => {
    setShowCommentBox(true);
  };

  const handleAssignTicket = () => {
    // Navigate to ticket page for assignment
    router.push(`/tickets/${ticket.id}?action=assign`);
    onClose();
  };

  const handleChangeQueue = () => {
    setShowReassignModal(true);
  };

  const handleResolveTicket = () => {
    setShowClosingModal(true);
  };

  const handleCloseTicket = () => {
    setShowClosingModal(true);
  };

  const handleReopenTicket = async () => {
    try {
      await updateTicketStatusService(
        { status: TicketStatus.OPENED },
        { id: ticket.id }
      );
      router.push(`/tickets/${ticket.id}`);
      onClose();
    } catch (error) {
      console.error("Error reopening ticket:", error);
    }
  };

  const handleConfirmStatusChange = async () => {
    try {
      let targetStatus = TicketStatus.RESOLVED;
      if (ticket.status === "Resolved") {
        targetStatus = TicketStatus.CLOSED;
      }

      await updateTicketStatusService(
        { status: targetStatus, closingNotes: closingNotes || undefined },
        { id: ticket.id }
      );

      setShowClosingModal(false);
      setClosingNotes("");
      router.push(`/tickets/${ticket.id}`);
      onClose();
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleCommentSubmitted = () => {
    setShowCommentBox(false);
    // Optionally refresh ticket data or show success message
  };

  const handleReassignQueue = () => {
    setShowReassignModal(false);
    // Optionally refresh ticket data or show success message
  };

  const getUserName = (userId: string) => {
    if (userId === "system") return "System";
    const user = users[userId];
    return user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
      : userId;
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

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <Text fw={600}>
              {t("timeline:modal.title")} #{ticket.id.slice(-8)}
            </Text>
          </Group>
        }
        size="md"
        centered
      >
        <Stack gap="md">
          {/* Ticket Header Info */}
          <Paper p="md" bg="gray.0" radius="md">
            <Stack gap="sm">
              <Text fw={500} lineClamp={2}>
                {ticket.title}
              </Text>

              <Group gap="xs">
                <Badge
                  color={getStatusColor(ticket.status)}
                  variant="filled"
                  size="sm"
                >
                  {ticket.status}
                </Badge>

                <Badge
                  color={getPriorityColor(ticket.priority)}
                  variant="light"
                  size="sm"
                >
                  {ticket.priority} {t("timeline:priority.label")}
                </Badge>
              </Group>

              <Group
                gap="md"
                style={{
                  fontSize: "12px",
                  color: "var(--mantine-color-gray-6)",
                }}
              >
                <Group gap="xs">
                  <IconCalendar size={14} />
                  <Text size="xs">
                    {t("timeline:created")}: {formatDate(ticket.createdAt)}
                  </Text>
                </Group>

                {ticket.closedAt && (
                  <Group gap="xs">
                    <IconLock size={14} />
                    <Text size="xs">
                      {t("timeline:closed")}: {formatDate(ticket.closedAt)}
                    </Text>
                  </Group>
                )}
              </Group>

              {ticket.category && (
                <Text size="xs" c="dimmed">
                  <strong>{t("timeline:category")}:</strong>{" "}
                  {ticket.category.name}
                </Text>
              )}
            </Stack>
          </Paper>

          <Divider />

          {/* Action Buttons */}
          <Stack gap="sm">
            <Text fw={500} size="sm">
              {t("timeline:modal.actions")}
            </Text>

            <Group grow>
              <Button
                leftSection={<IconEye size={16} />}
                variant="filled"
                onClick={handleViewTicket}
              >
                {t("timeline:actions.viewTicket")}
              </Button>

              <Button
                leftSection={<IconMessagePlus size={16} />}
                variant="light"
                onClick={handleAddComment}
              >
                {t("timeline:actions.addComment")}
              </Button>
            </Group>

            <Group grow>
              <Button
                leftSection={<IconUserCheck size={16} />}
                variant="light"
                color="blue"
                onClick={handleAssignTicket}
                disabled={ticket.status === "Closed"}
              >
                {ticket.assignedToId
                  ? t("timeline:actions.reassign")
                  : t("timeline:actions.assign")}
              </Button>

              <Button
                leftSection={<IconArrowsExchange size={16} />}
                variant="light"
                color="indigo"
                onClick={handleChangeQueue}
                disabled={ticket.status === "Closed"}
              >
                {t("timeline:actions.changeQueue")}
              </Button>
            </Group>

            {/* Status action buttons based on current status */}
            {(ticket.status === "Opened" ||
              ticket.status === "In Progress") && (
              <Button
                leftSection={<IconCheck size={16} />}
                variant="light"
                color="green"
                onClick={handleResolveTicket}
                fullWidth
              >
                {t("timeline:actions.resolveTicket")}
              </Button>
            )}

            {ticket.status === "Resolved" && (
              <Button
                leftSection={<IconLock size={16} />}
                variant="light"
                color="red"
                onClick={handleCloseTicket}
                fullWidth
              >
                {t("timeline:actions.closeTicket")}
              </Button>
            )}

            {(ticket.status === "Resolved" || ticket.status === "Closed") && (
              <Button
                leftSection={<IconLockOpen size={16} />}
                variant="light"
                color="blue"
                onClick={handleReopenTicket}
                fullWidth
              >
                {t("timeline:actions.reopenTicket")}
              </Button>
            )}
          </Stack>

          {/* Ticket History */}
          <Divider />
          <Stack gap="sm">
            <Text fw={500} size="sm">
              Recent Activity (Last 3 entries)
            </Text>

            {isLoadingHistory ? (
              <Center py="md">
                <Loader size="sm" />
              </Center>
            ) : historyItems.length > 0 ? (
              <ScrollArea h={150}>
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
                            {formatDate(item.createdAt)}
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
              </ScrollArea>
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No recent activity
              </Text>
            )}
          </Stack>
        </Stack>
      </Modal>

      {/* Comment Box Modal */}
      {showCommentBox && (
        <Modal
          opened={showCommentBox}
          onClose={() => setShowCommentBox(false)}
          title={t("timeline:modal.addComment")}
          size="lg"
        >
          <CommentBox
            onSubmit={(comment) => {
              // TODO: Implement comment submission API call
              console.log("Comment submitted:", comment);
              handleCommentSubmitted();
            }}
          />
        </Modal>
      )}

      {/* Reassign Queue Modal */}
      <ReassignQueueModal
        opened={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onConfirm={handleReassignQueue}
        currentQueueId={ticket.queueId}
        currentCategoryId={ticket.categoryId}
      />

      {/* Closing/Resolution Modal */}
      <ClosingModal
        opened={showClosingModal}
        onClose={() => {
          setShowClosingModal(false);
          setClosingNotes("");
        }}
        title={
          ticket.status === "Resolved"
            ? t("timeline:modal.closeTicket")
            : t("timeline:modal.resolveTicket")
        }
        centered
        maxWidth="md"
        actions={[
          <Button
            key="cancel"
            variant="light"
            color="gray"
            onClick={() => {
              setShowClosingModal(false);
              setClosingNotes("");
            }}
          >
            {t("common:actions.cancel")}
          </Button>,
          <Button
            key="confirm"
            color={ticket.status === "Resolved" ? "red" : "green"}
            onClick={handleConfirmStatusChange}
          >
            {ticket.status === "Resolved"
              ? t("timeline:actions.closeTicket")
              : t("timeline:actions.resolveTicket")}
          </Button>,
        ]}
      >
        <Stack>
          <Text size="sm" c="dimmed">
            {ticket.status === "Resolved"
              ? t("timeline:modal.closeDescription")
              : t("timeline:modal.resolveDescription")}
          </Text>
          <Textarea
            label={t("timeline:modal.notesLabel")}
            placeholder={t("timeline:modal.notesPlaceholder")}
            value={closingNotes}
            onChange={(event) => setClosingNotes(event.currentTarget.value)}
            minRows={3}
            maxRows={6}
            autosize
          />
        </Stack>
      </ClosingModal>
    </>
  );
}
