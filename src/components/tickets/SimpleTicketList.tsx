// src/components/tickets/SimpleTicketList.tsx
import React from "react";
import {
  Table,
  Badge,
  Text,
  Button,
  LoadingOverlay,
  Stack,
  Group,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "@/services/api/services/tickets";

// Extended ticket type that includes queue and category names
type TicketWithRelations = Ticket & {
  queue?: { id: string; name: string };
  category?: { id: string; name: string };
};
import { formatDate } from "@/utils/format-date";
import { ResponsiveDisplay } from "@/components/responsive-display/ResponsiveDisplay";
import { TicketListMobile } from "./TicketListMobile";

interface SimpleTicketListProps {
  tickets: TicketWithRelations[];
  onViewTicket: (ticketId: string) => void;
  isLoading: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

// Define consistent column widths
const COLUMN_WIDTHS = {
  id: "8%",
  title: "25%",
  queue: "15%",
  category: "15%",
  status: "12%",
  priority: "12%",
  date: "13%",
};

export function SimpleTicketList({
  tickets,
  onViewTicket,
  isLoading,
  hasNextPage,
  onLoadMore,
  isLoadingMore,
}: SimpleTicketListProps) {
  const { t } = useTranslation("tickets");

  const getStatusBadgeColor = (status: TicketStatus) => {
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

  const getPriorityBadgeColor = (priority: TicketPriority) => {
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

  if (isLoading) {
    return (
      <div style={{ position: "relative", minHeight: 200 }}>
        <LoadingOverlay visible={isLoading} />
      </div>
    );
  }

  return (
    <Stack gap="md">
      <ResponsiveDisplay
        desktopContent={
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: COLUMN_WIDTHS.id }}>
                  {t("tickets:tickets.table.id")}
                </Table.Th>
                <Table.Th style={{ width: COLUMN_WIDTHS.title }}>
                  {t("tickets:tickets.table.title")}
                </Table.Th>
                <Table.Th style={{ width: COLUMN_WIDTHS.queue }}>
                  {t("tickets:tickets.table.queue")}
                </Table.Th>
                <Table.Th style={{ width: COLUMN_WIDTHS.category }}>
                  {t("tickets:tickets.table.category")}
                </Table.Th>
                <Table.Th style={{ width: COLUMN_WIDTHS.status }}>
                  {t("tickets:tickets.table.status")}
                </Table.Th>
                <Table.Th style={{ width: COLUMN_WIDTHS.priority }}>
                  {t("tickets:tickets.table.priority")}
                </Table.Th>
                <Table.Th style={{ width: COLUMN_WIDTHS.date }}>
                  {t("tickets:tickets.table.created")}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tickets.map((ticket) => (
                <Table.Tr
                  key={ticket.id}
                  onClick={() => onViewTicket(ticket.id)}
                  style={{ cursor: "pointer" }}
                  data-testid={`ticket-row-${ticket.id}`}
                >
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      #{ticket.id.substring(ticket.id.length - 6)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={2}>
                      {ticket.title}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {ticket.queue?.name ||
                        t("tickets:tickets.table.unknownQueue")}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {ticket.category?.name ||
                        t("tickets:tickets.table.unknownCategory")}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getStatusBadgeColor(ticket.status)}
                      variant="light"
                      size="sm"
                    >
                      {t(`tickets:tickets.statuses.${ticket.status}`)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getPriorityBadgeColor(ticket.priority)}
                      variant="light"
                      size="sm"
                    >
                      {t(`tickets:tickets.priorities.${ticket.priority}`)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatDate(new Date(ticket.createdAt))}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        }
        mobileContent={
          <TicketListMobile
            tickets={tickets}
            onViewTicket={onViewTicket}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            onLoadMore={onLoadMore}
            isLoadingMore={isLoadingMore}
          />
        }
      />

      {/* Load More Button for Desktop */}
      <ResponsiveDisplay
        desktopContent={
          hasNextPage && onLoadMore ? (
            <Group justify="center" mt="lg">
              <Button
                onClick={onLoadMore}
                loading={isLoadingMore}
                variant="outline"
                data-testid="load-more-button"
              >
                {t("common:loadMore")}
              </Button>
            </Group>
          ) : null
        }
        mobileContent={null}
      />

      {/* Empty State */}
      {tickets.length === 0 && !isLoading && (
        <Text ta="center" c="dimmed" py="xl">
          {t("tickets:tickets.noTickets")}
        </Text>
      )}
    </Stack>
  );
}
