// src/app/[language]/my-tickets/page-content.tsx
"use client";
import React, { useState } from "react";
import {
  Container,
  Title,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Card,
  Badge,
  Grid,
  ActionIcon,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { IconPlus, IconEye, IconCalendar, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import {
  useAllTicketsQuery,
  useTicketStatisticsQuery,
  useCreateTicketMutation,
  TicketStatus,
  TicketPriority,
} from "@/app/[language]/tickets/queries/ticket-queries";
import { TicketForm } from "@/components/tickets/TicketForm";
import useLanguage from "@/services/i18n/use-language";
import { formatDate } from "@/utils/format-date";
import { Ticket } from "@/services/api/services/tickets";

function MyTicketsPage() {
  const { t } = useTranslation("tickets");
  const router = useRouter();
  const language = useLanguage();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const createTicketMutation = useCreateTicketMutation();

  // Query all user's tickets (no pagination)
  const { data: tickets = [], isLoading: ticketsLoading } = useAllTicketsQuery({
    createdById: user?.id?.toString(),
  });

  // Get accurate statistics for user's tickets
  const { data: statistics, isLoading: statsLoading } =
    useTicketStatisticsQuery({
      createdById: user?.id?.toString(),
    });

  const isLoading = ticketsLoading || statsLoading;

  const handleCreateTicket = (values: {
    queueId: string;
    categoryId: string;
    title: string;
    details: string;
    priority: TicketPriority;
    file?: { id: string; path: string } | null;
  }) => {
    createTicketMutation.mutate(
      {
        queueId: values.queueId,
        categoryId: values.categoryId,
        title: values.title,
        details: values.details,
        priority: values.priority,
        documentIds: values.file ? [values.file.id] : undefined,
      },
      {
        onSuccess: (ticket) => {
          setIsCreateModalOpen(false);
          router.push(`/${language}/tickets/${ticket.id}`);
        },
      }
    );
  };

  const handleViewTicket = (ticketId: string) => {
    router.push(`/${language}/tickets/${ticketId}`);
  };

  const renderPriorityBadge = (priority: TicketPriority) => {
    const colorMap: Record<TicketPriority, string> = {
      [TicketPriority.HIGH]: "red",
      [TicketPriority.MEDIUM]: "yellow",
      [TicketPriority.LOW]: "green",
    };
    return (
      <Badge color={colorMap[priority]} size="sm" variant="light">
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

    const statusKey = status.toLowerCase().replace(" ", "");
    return (
      <Badge color={colorMap[status]} size="sm" variant="filled">
        {t(`tickets:tickets.statuses.${statusKey}`)}
      </Badge>
    );
  };

  const renderTicketCard = (ticket: Ticket) => (
    <Card key={ticket.id} shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="apart" align="flex-start">
          <div>
            <Group gap="xs" mb="xs">
              <Text size="xs" c="dimmed">
                #{ticket.id.substring(ticket.id.length - 6)}
              </Text>
              {renderStatusBadge(ticket.status)}
              {renderPriorityBadge(ticket.priority)}
            </Group>
            <Title order={4} lineClamp={2} mb="xs">
              {ticket.title}
            </Title>
          </div>
          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            onClick={() => handleViewTicket(ticket.id)}
          >
            <IconEye size={18} />
          </ActionIcon>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={3}>
          {ticket.details}
        </Text>

        <Group gap="md" mt="sm">
          <Group gap="xs">
            <IconCalendar size={14} />
            <Text size="xs" c="dimmed">
              {formatDate(new Date(ticket.createdAt))}
            </Text>
          </Group>
          {ticket.assignedToId && (
            <Group gap="xs">
              <IconUser size={14} />
              <Text size="xs" c="dimmed">
                {t("tickets:tickets.fields.assignedTo")}: Assigned
              </Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Card>
  );

  // Separate tickets by status (from actual data)
  const openTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.OPENED
  );
  const closedTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.CLOSED
  );

  // Use statistics for accurate counts (fallback to filtered counts if stats unavailable)
  const openCount = statistics?.open ?? openTickets.length;
  const closedCount = statistics?.closed ?? closedTickets.length;

  if (isLoading) {
    return (
      <Container size="lg">
        <Text ta="center" mt="xl">
          {t("common:loading")}
        </Text>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Group justify="apart" mb="xl">
        <div>
          <Title order={2}>{t("tickets:myTickets.pageTitle")}</Title>
          <Text c="dimmed" size="sm">
            {t("tickets:myTickets.description")}
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsCreateModalOpen(true)}
          data-testid="create-ticket-button"
        >
          {t("tickets:tickets.actions.create")}
        </Button>
      </Group>

      {/* Summary Cards */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card withBorder padding="lg" radius="md">
            <Text size="sm" c="dimmed">
              {t("tickets:myTickets.openTickets")}
            </Text>
            <Text size="xl" fw={700} c="blue">
              {openCount}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card withBorder padding="lg" radius="md">
            <Text size="sm" c="dimmed">
              {t("tickets:myTickets.closedTickets")}
            </Text>
            <Text size="xl" fw={700} c="gray">
              {closedCount}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Open Tickets Section */}
      {openTickets.length > 0 && (
        <Stack gap="md" mb="xl">
          <Title order={3} c="blue">
            {t("tickets:myTickets.openTickets")}
          </Title>
          <Stack gap="md">{openTickets.map(renderTicketCard)}</Stack>
        </Stack>
      )}

      {/* Closed Tickets Section */}
      {closedTickets.length > 0 && (
        <Stack gap="md">
          <Title order={3} c="gray">
            {t("tickets:myTickets.closedTickets")}
          </Title>
          <Stack gap="md">{closedTickets.map(renderTicketCard)}</Stack>
        </Stack>
      )}

      {/* Empty State */}
      {tickets && tickets.length === 0 && (
        <Card withBorder p="xl" radius="md" ta="center">
          <Text fw={500} mb="sm">
            {t("tickets:myTickets.empty")}
          </Text>
          <Text c="dimmed" size="sm" mb="lg">
            {t("tickets:myTickets.emptyDescription")}
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
            variant="light"
          >
            {t("tickets:tickets.actions.create")}
          </Button>
        </Card>
      )}

      {/* Create Ticket Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("tickets:tickets.createTicket")}
        size="lg"
      >
        <TicketForm
          onSubmit={handleCreateTicket}
          isSubmitting={createTicketMutation.isPending}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </Container>
  );
}

export default MyTicketsPage;
