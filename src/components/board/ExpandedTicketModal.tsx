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
} from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { formatDate } from "@/utils/format-date";
import { TicketStatus, TicketPriority } from "@/services/api/services/tickets";
import { useGetHistoryItemsByTicketService } from "@/services/api/services/history-items";
import { useGetUserService } from "@/services/api/services/users";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

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
}: ExpandedTicketModalProps) {
  const { t } = useTranslation("tickets");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [creator, setCreator] = useState<User | null>(null);

  const getHistoryItemsByTicketService = useGetHistoryItemsByTicketService();
  const getUserService = useGetUserService();

  useEffect(() => {
    const fetchHistoryAndUsers = async () => {
      if (!ticket) return;

      setIsLoadingHistory(true);
      try {
        // Fetch history items
        const historyResponse = await getHistoryItemsByTicketService({
          ticketId: ticket.id,
        });

        if (historyResponse.status === HTTP_CODES_ENUM.OK) {
          const historyData = historyResponse.data || [];
          setHistoryItems(historyData);

          // Get unique user IDs
          const userIds = Array.from(
            new Set<string>([
              ticket.createdById,
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
          if (ticket.createdById && userMap[ticket.createdById]) {
            setCreator(userMap[ticket.createdById]);
          }
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (opened && ticket) {
      fetchHistoryAndUsers();
    }
  }, [opened, ticket, getHistoryItemsByTicketService, getUserService]);

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

  if (!ticket) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Text size="sm" c="dimmed">
            #{ticket.id.slice(-6)}
          </Text>
        </Group>
      }
      size="xl"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      styles={{
        content: {
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        },
        body: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <Stack gap="md" style={{ flex: 1, overflow: "hidden" }}>
        {/* Header */}
        <Box>
          <Title order={3} mb="md">
            {ticket.title}
          </Title>

          <Group gap="xl" wrap="wrap">
            <Group gap="xs">
              <IconFlag size={16} />
              <Badge
                color={getPriorityColor(ticket.priority)}
                variant="filled"
                size="sm"
              >
                {ticket.priority}
              </Badge>
            </Group>

            <Group gap="xs">
              <Badge
                color={getStatusColor(ticket.status)}
                variant="filled"
                size="sm"
              >
                {ticket.status}
              </Badge>
            </Group>

            {ticket.category && (
              <Group gap="xs">
                <IconCategory size={16} />
                <Text size="sm">{ticket.category.name}</Text>
              </Group>
            )}

            <Group gap="xs">
              <IconUser size={16} />
              <Text size="sm">
                {creator
                  ? `${creator.firstName || ""} ${creator.lastName || ""}`.trim() ||
                    creator.email
                  : t("common:unknown")}
              </Text>
            </Group>

            <Group gap="xs">
              <IconCalendar size={16} />
              <Text size="sm">{formatDate(new Date(ticket.createdAt))}</Text>
            </Group>
          </Group>
        </Box>

        <Divider />

        {/* Details */}
        <Box>
          <Text fw={600} size="sm" mb="xs">
            {t("tickets:tickets.fields.details")}
          </Text>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {ticket.details}
          </Text>
        </Box>

        {ticket.closingNotes && (
          <>
            <Divider />
            <Box>
              <Text fw={600} size="sm" mb="xs">
                {t("tickets:tickets.fields.closingNotes")}
              </Text>
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {ticket.closingNotes}
              </Text>
            </Box>
          </>
        )}

        <Divider />

        {/* History Timeline */}
        <Box style={{ flex: 1, minHeight: 0 }}>
          <Text fw={600} size="sm" mb="md">
            {t("tickets:tickets.timeline")}
          </Text>

          {isLoadingHistory ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : (
            <ScrollArea style={{ height: "300px" }} offsetScrollbars>
              <Timeline
                active={historyItems.length}
                bulletSize={24}
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
            </ScrollArea>
          )}
        </Box>
      </Stack>
    </Modal>
  );
}
