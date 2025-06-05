// src/components/tickets/TicketTimeline.tsx
import React from "react";
import {
  Timeline,
  Text,
  Group,
  Avatar,
  Box,
  Paper,
  Badge,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import {
  HistoryItem,
  HistoryItemType,
} from "@/services/api/services/history-items";
import {
  IconMessage,
  IconCirclePlus,
  IconUser,
  IconStatusChange,
  IconLock,
  IconLockOpen,
  IconFile,
  IconTrash,
  IconFlag,
  IconCategory,
} from "@tabler/icons-react";
import { formatDate } from "@/utils/format-date";

interface TicketTimelineProps {
  historyItems: HistoryItem[];
  users: { id: string; name: string }[];
}

export function TicketTimeline({ historyItems, users }: TicketTimelineProps) {
  const { t } = useTranslation("tickets");

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

  // Parse assignment details to get user names
  const parseAssignmentDetails = (details: string) => {
    // Check if it's a reassignment (from user X to user Y)
    const reassignMatch = details.match(
      /from user ([a-f0-9]+) to user ([a-f0-9]+)/
    );
    if (reassignMatch) {
      const [, fromUserId, toUserId] = reassignMatch;
      return {
        fromUser: getUserName(fromUserId),
        toUser: getUserName(toUserId),
        isReassign: true,
      };
    }

    // Check if it's a direct assignment (to user Y)
    const initialAssignMatch = details.match(/to user ([a-f0-9]+)/);
    if (initialAssignMatch) {
      const [, toUserId] = initialAssignMatch;
      return {
        fromUser: null,
        toUser: getUserName(toUserId),
        isReassign: false,
      };
    }

    return { fromUser: null, toUser: null, isReassign: false };
  };

  // Extract document name from history details
  const getDocumentDetails = (details: string) => {
    const match = details.match(/: (.+)/);
    return match ? match[1] : "Unknown document";
  };

  const getIconForHistoryType = (type: HistoryItemType) => {
    switch (type) {
      case HistoryItemType.COMMENT:
        return <IconMessage size={16} />;
      case HistoryItemType.CREATED:
        return <IconCirclePlus size={16} />;
      case HistoryItemType.ASSIGNED:
        return <IconUser size={16} />;
      case HistoryItemType.STATUS_CHANGED:
        return <IconStatusChange size={16} />;
      case HistoryItemType.CLOSED:
        return <IconLock size={16} />;
      case HistoryItemType.REOPENED:
        return <IconLockOpen size={16} />;
      case HistoryItemType.DOCUMENT_ADDED:
        return <IconFile size={16} />;
      case HistoryItemType.DOCUMENT_REMOVED:
        return <IconTrash size={16} />;
      case HistoryItemType.PRIORITY_CHANGED:
        return <IconFlag size={16} />;
      case HistoryItemType.CATEGORY_CHANGED:
        return <IconCategory size={16} />;
      default:
        return <IconMessage size={16} />;
    }
  };

  const getColorForHistoryType = (type: HistoryItemType) => {
    switch (type) {
      case HistoryItemType.COMMENT:
        return "blue";
      case HistoryItemType.CREATED:
        return "green";
      case HistoryItemType.ASSIGNED:
        return "violet";
      case HistoryItemType.STATUS_CHANGED:
        return "orange";
      case HistoryItemType.CLOSED:
        return "red";
      case HistoryItemType.REOPENED:
        return "green";
      case HistoryItemType.DOCUMENT_ADDED:
        return "teal";
      case HistoryItemType.DOCUMENT_REMOVED:
        return "pink";
      case HistoryItemType.PRIORITY_CHANGED:
        return "yellow";
      case HistoryItemType.CATEGORY_CHANGED:
        return "cyan";
      default:
        return "gray";
    }
  };

  const isUserAction = (type: HistoryItemType) => {
    return type === HistoryItemType.COMMENT;
  };

  if (historyItems.length === 0) {
    return (
      <Paper withBorder p="md">
        <Text ta="center" c="dimmed">
          {t("tickets:tickets.noHistory")}
        </Text>
      </Paper>
    );
  }

  // Group history items by date
  const groupedItems: { [key: string]: HistoryItem[] } = {};
  historyItems.forEach((item) => {
    const date = new Date(item.createdAt).toDateString();
    if (!groupedItems[date]) {
      groupedItems[date] = [];
    }
    groupedItems[date].push(item);
  });

  return (
    <Timeline active={historyItems.length - 1} bulletSize={24} lineWidth={2}>
      {Object.entries(groupedItems).map(([date, items]) => (
        <React.Fragment key={date}>
          <Timeline.Item
            bullet={<IconStatusChange size={12} />}
            title={
              <Text fw={700} c="dimmed" size="sm">
                {formatDate(new Date(date))}
              </Text>
            }
          />
          {items.map((item) => (
            <Timeline.Item
              key={item.id}
              bullet={getIconForHistoryType(item.type)}
              color={getColorForHistoryType(item.type)}
            >
              <Group mb={isUserAction(item.type) ? "xs" : 0}>
                <Avatar
                  size="sm"
                  radius="xl"
                  color={getColorForHistoryType(item.type)}
                >
                  {getUserName(item.userId).charAt(0)}
                </Avatar>
                <Box style={{ flexGrow: 1 }}>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      {getUserName(item.userId)}
                    </Text>
                    <Badge size="sm" color={getColorForHistoryType(item.type)}>
                      {t(`tickets:historyTypes.${item.type.toLowerCase()}`)}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Group>

                  {/* Content based on history type */}
                  {isUserAction(item.type) ? (
                    <Text size="sm" mt="xs">
                      {item.details}
                    </Text>
                  ) : item.type === HistoryItemType.ASSIGNED ? (
                    <Text size="sm" mt="xs">
                      {(() => {
                        const { fromUser, toUser, isReassign } =
                          parseAssignmentDetails(item.details);
                        if (isReassign && fromUser && toUser) {
                          return (
                            <>
                              Reassigned from{" "}
                              <Text span fw={500}>
                                {fromUser}
                              </Text>{" "}
                              to{" "}
                              <Text span fw={500}>
                                {toUser}
                              </Text>
                            </>
                          );
                        } else if (toUser) {
                          return (
                            <>
                              Assigned to{" "}
                              <Text span fw={500}>
                                {toUser}
                              </Text>
                            </>
                          );
                        }
                        return item.details;
                      })()}
                    </Text>
                  ) : (
                    (item.type === HistoryItemType.DOCUMENT_ADDED ||
                      item.type === HistoryItemType.DOCUMENT_REMOVED) && (
                      <Text size="sm" mt="xs">
                        {item.type === HistoryItemType.DOCUMENT_ADDED
                          ? "Added document: "
                          : "Removed document: "}
                        <Text span fw={500}>
                          {getDocumentDetails(item.details)}
                        </Text>
                      </Text>
                    )
                  )}
                </Box>
              </Group>
            </Timeline.Item>
          ))}
        </React.Fragment>
      ))}
    </Timeline>
  );
}
