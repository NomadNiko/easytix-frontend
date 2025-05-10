// src/components/tickets/TicketList.tsx
import React from "react";
import {
  Table,
  Group,
  ActionIcon,
  Badge,
  Text,
  Card,
  Select,
  TextInput,
  Grid,
  Paper,
  Button,
  Title,
} from "@mantine/core";
import { IconEye, IconSearch, IconX } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "@/services/api/services/tickets";
import { formatDate } from "@/utils/format-date";
import { QueueSelect } from "./queues/QueueSelect";
import { ResponsiveDisplay } from "@/components/responsive-display/ResponsiveDisplay";
import { TicketListMobile } from "./TicketListMobile";
import { TicketFiltersMobile } from "./TicketFiltersMobile";

interface TicketListProps {
  tickets: Ticket[];
  onViewTicket: (ticketId: string) => void;
  onEditTicket: (ticketId: string) => void;
  onFilterChange: (filters: {
    queueId?: string | null;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    search?: string | null;
  }) => void;
  filters: {
    queueId?: string | null;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    search?: string | null;
  };
  isLoading: boolean;
}

// Define consistent column widths to use across the application
const COLUMN_WIDTHS = {
  id: "10%",
  title: "35%",
  status: "15%",
  priority: "15%",
  date: "15%",
  actions: "10%",
};

export function TicketList({
  tickets,
  onViewTicket,
  onFilterChange,
  filters,
  isLoading,
}: TicketListProps) {
  const { t } = useTranslation("tickets");

  const handleFilterChange = <K extends keyof typeof filters>(
    field: K,
    value: (typeof filters)[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      queueId: null,
      status: null,
      priority: null,
      search: null,
    });
  };

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
      [TicketStatus.CLOSED]: "gray",
    };
    return (
      <Badge color={colorMap[status]} size="sm">
        {status}
      </Badge>
    );
  };

  const statusOptions = [
    { value: TicketStatus.OPENED, label: t("tickets:tickets.statuses.opened") },
    { value: TicketStatus.CLOSED, label: t("tickets:tickets.statuses.closed") },
  ];

  const priorityOptions = [
    { value: TicketPriority.HIGH, label: t("tickets:tickets.priorities.high") },
    {
      value: TicketPriority.MEDIUM,
      label: t("tickets:tickets.priorities.medium"),
    },
    { value: TicketPriority.LOW, label: t("tickets:tickets.priorities.low") },
  ];

  if (isLoading) {
    return (
      <Card withBorder p="xl" radius="md" my="md">
        <Text ta="center" fw={500}>
          {t("common:loading")}
        </Text>
      </Card>
    );
  }

  // Desktop version with full table
  const DesktopContent = () => (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">
        {t("tickets:tickets.ticketList")}
      </Title>
      {/* Filters */}
      <Paper withBorder p="md" mb="md">
        <Grid>
          <Grid.Col span={{ xs: 12, sm: 6, md: 3 }}>
            <QueueSelect
              value={filters.queueId || null}
              onChange={(value) => handleFilterChange("queueId", value)}
              label={t("tickets:tickets.filters.queue")}
              placeholder={t("tickets:tickets.filters.anyQueue")}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 3 }}>
            <Select
              label={t("tickets:tickets.filters.status")}
              placeholder={t("tickets:tickets.filters.anyStatus")}
              data={statusOptions}
              value={filters.status || null}
              onChange={(value) =>
                handleFilterChange("status", value as TicketStatus | null)
              }
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 3 }}>
            <Select
              label={t("tickets:tickets.filters.priority")}
              placeholder={t("tickets:tickets.filters.anyPriority")}
              data={priorityOptions}
              value={filters.priority || null}
              onChange={(value) =>
                handleFilterChange("priority", value as TicketPriority | null)
              }
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 3 }}>
            <TextInput
              label={t("tickets:tickets.filters.search")}
              placeholder={t("tickets:tickets.filters.searchPlaceholder")}
              value={filters.search || ""}
              onChange={(e) =>
                handleFilterChange("search", e.target.value || null)
              }
              rightSection={
                filters.search ? (
                  <ActionIcon
                    size="sm"
                    onClick={() => handleFilterChange("search", null)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                ) : (
                  <IconSearch size={16} />
                )
              }
            />
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            leftSection={<IconX size={16} />}
            onClick={handleClearFilters}
            size="compact-sm"
          >
            {t("tickets:tickets.filters.clearFilters")}
          </Button>
        </Group>
      </Paper>
      {tickets.length === 0 ? (
        <Card withBorder p="xl" radius="md" my="md">
          <Text ta="center" fw={500} c="dimmed">
            {t("tickets:tickets.empty")}
          </Text>
        </Card>
      ) : (
        <Table horizontalSpacing="sm" verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: COLUMN_WIDTHS.id }}>
                {t("tickets:tickets.fields.id")}
              </Table.Th>
              <Table.Th style={{ width: COLUMN_WIDTHS.title }}>
                {t("tickets:tickets.fields.title")}
              </Table.Th>
              <Table.Th style={{ width: COLUMN_WIDTHS.status }}>
                {t("tickets:tickets.fields.status")}
              </Table.Th>
              <Table.Th style={{ width: COLUMN_WIDTHS.priority }}>
                {t("tickets:tickets.fields.priority")}
              </Table.Th>
              <Table.Th style={{ width: COLUMN_WIDTHS.date }}>
                {t("tickets:tickets.fields.created")}
              </Table.Th>
              <Table.Th style={{ width: COLUMN_WIDTHS.actions }}>
                {t("common:fields.actions")}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tickets.map((ticket) => (
              <Table.Tr key={ticket.id}>
                <Table.Td style={{ width: COLUMN_WIDTHS.id }}>
                  <Text size="sm" fw={500}>
                    #{ticket.id.substring(ticket.id.length - 6)}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: COLUMN_WIDTHS.title }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {ticket.title}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: COLUMN_WIDTHS.status }}>
                  {renderStatusBadge(ticket.status)}
                </Table.Td>
                <Table.Td style={{ width: COLUMN_WIDTHS.priority }}>
                  {renderPriorityBadge(ticket.priority)}
                </Table.Td>
                <Table.Td style={{ width: COLUMN_WIDTHS.date }}>
                  <Text size="sm" c="dimmed">
                    {formatDate(new Date(ticket.createdAt))}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: COLUMN_WIDTHS.actions }}>
                  <Group gap="xs">
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="blue"
                      onClick={() => onViewTicket(ticket.id)}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );

  // Mobile version with simplified cards
  const MobileContent = () => (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">
        {t("tickets:tickets.ticketList")}
      </Title>
      <TicketFiltersMobile filters={filters} onFilterChange={onFilterChange} />
      <TicketListMobile
        tickets={tickets}
        onViewTicket={onViewTicket}
        isLoading={isLoading}
      />
    </Paper>
  );

  return (
    <ResponsiveDisplay
      desktopContent={<DesktopContent />}
      mobileContent={<MobileContent />}
    />
  );
}
