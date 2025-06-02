// src/components/tickets/TicketListMobile.tsx
import React from "react";
import { Card, Group, Text, Stack, Badge, Button } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "@/services/api/services/tickets";
import { formatDate } from "@/utils/format-date";

interface TicketListMobileProps {
  tickets: Ticket[];
  onViewTicket: (ticketId: string) => void;
  isLoading: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function TicketListMobile({
  tickets,
  onViewTicket,
  hasNextPage,
  onLoadMore,
  isLoadingMore,
}: TicketListMobileProps) {
  const { t } = useTranslation("tickets");

  const renderPriorityBadge = (priority: TicketPriority) => {
    const colorMap: Record<TicketPriority, string> = {
      [TicketPriority.HIGH]: "red",
      [TicketPriority.MEDIUM]: "yellow",
      [TicketPriority.LOW]: "green",
    };
    return (
      <Badge color={colorMap[priority]} size="sm">
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
      <Badge color={colorMap[status]} size="sm">
        {status}
      </Badge>
    );
  };

  if (tickets.length === 0) {
    return (
      <Card withBorder p="lg" radius="md">
        <Text ta="center" fw={500} c="dimmed">
          {t("tickets:tickets.empty")}
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Stack gap="md">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            p="sm"
            withBorder
            shadow="sm"
            style={{ cursor: "pointer" }}
            onClick={() => onViewTicket(ticket.id)}
          >
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" fw={700}>
                  #{ticket.id.substring(ticket.id.length - 6)}
                </Text>
                <Group gap={8}>
                  {renderStatusBadge(ticket.status)}
                  {renderPriorityBadge(ticket.priority)}
                </Group>
              </Group>

              <Text size="sm" fw={500} lineClamp={2}>
                {ticket.title}
              </Text>

              <Group justify="space-between">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">
                    {ticket.queue?.name || "-"} / {ticket.category?.name || "-"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDate(new Date(ticket.createdAt))}
                  </Text>
                </Stack>
                <IconEye size={18} color="var(--mantine-color-blue-6)" />
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
      {hasNextPage && (
        <Group justify="center" mt="xl">
          <Button
            onClick={onLoadMore}
            loading={isLoadingMore}
            variant="subtle"
            size="md"
            fullWidth
            data-testid="load-more-tickets-mobile"
          >
            {t("common:loadMore")}
          </Button>
        </Group>
      )}
    </>
  );
}
