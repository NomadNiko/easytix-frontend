// src/app/[language]/my-tickets/page-content.tsx
"use client";
import React, { useState, useMemo } from "react";
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
  useMantineTheme,
  Tabs,
  Box,
  Tooltip,
  Progress,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import {
  IconPlus,
  IconEye,
  IconCalendar,
  IconUser,
  IconTicket,
  IconCircleCheck,
  IconProgress,
  IconLock,
  IconClock,
  IconPaperclip,
  IconMessage,
  IconCategory,
  IconFlag,
  IconAlertCircle,
  IconCircleX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import {
  useAllTicketsQuery,
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
  const theme = useMantineTheme();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("active");

  const createTicketMutation = useCreateTicketMutation();

  // Query all user's tickets (no pagination)
  const { data: tickets = [], isLoading } = useAllTicketsQuery({
    createdById: user?.id?.toString(),
  });

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

  const getStatusBadge = (status: TicketStatus) => {
    const statusConfig = {
      [TicketStatus.OPENED]: { color: "blue", icon: IconAlertCircle },
      [TicketStatus.IN_PROGRESS]: { color: "yellow", icon: IconProgress },
      [TicketStatus.RESOLVED]: { color: "green", icon: IconCircleCheck },
      [TicketStatus.CLOSED]: { color: "gray", icon: IconCircleX },
    };
    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
      <Badge
        color={config.color}
        variant="light"
        size="sm"
        leftSection={<StatusIcon size={12} />}
      >
        {t(`tickets:tickets.statuses.${status}`)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const priorityConfig = {
      [TicketPriority.HIGH]: { color: "red", icon: IconFlag },
      [TicketPriority.MEDIUM]: { color: "yellow", icon: IconFlag },
      [TicketPriority.LOW]: { color: "green", icon: IconFlag },
    };
    const config = priorityConfig[priority];
    const PriorityIcon = config.icon;

    return (
      <Badge
        color={config.color}
        variant="light"
        size="sm"
        leftSection={<PriorityIcon size={12} />}
      >
        {t(`tickets:tickets.priorities.${priority}`)}
      </Badge>
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    if (diffInMinutes > 0) return `${diffInMinutes}m ago`;
    return "Just now";
  };

  const renderEnhancedTicketCard = (ticket: Ticket) => {
    const hasAttachments = ticket.documentIds && ticket.documentIds.length > 0;
    const isOverdue =
      ticket.status !== TicketStatus.CLOSED &&
      new Date(ticket.createdAt).getTime() <
        new Date().getTime() - 7 * 24 * 60 * 60 * 1000; // 7 days

    return (
      <Card
        key={ticket.id}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          cursor: "pointer",
          transition: "all 0.2s ease",
          height: "100%",
        }}
        onClick={() => handleViewTicket(ticket.id)}
        className="hover:shadow-md hover:-translate-y-1"
      >
        <Stack gap="md" h="100%">
          {/* Header with ID and actions */}
          <Group justify="apart" align="flex-start">
            <Group gap="xs">
              <Text size="xs" c="dimmed" ff="monospace" fw={600}>
                #{ticket.id.substring(ticket.id.length - 6)}
              </Text>
              {isOverdue && (
                <Tooltip label="Overdue (>7 days)">
                  <Badge color="red" size="xs" variant="filled">
                    <IconClock size={10} />
                  </Badge>
                </Tooltip>
              )}
            </Group>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                handleViewTicket(ticket.id);
              }}
            >
              <IconEye size={16} />
            </ActionIcon>
          </Group>

          {/* Title */}
          <Box>
            <Title
              order={5}
              lineClamp={2}
              mb="xs"
              style={{ minHeight: "2.4em" }}
            >
              {ticket.title}
            </Title>
            <Text
              size="sm"
              c="dimmed"
              lineClamp={3}
              style={{ minHeight: "3.6em" }}
            >
              {ticket.details}
            </Text>
          </Box>

          {/* Status and Priority */}
          <Group gap="xs">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </Group>

          {/* Queue and Category */}
          <Group gap="md">
            {ticket.queue && (
              <Group gap={4}>
                <IconTicket size={14} color={theme.colors.gray[6]} />
                <Text size="xs" c="dimmed">
                  {ticket.queue.name}
                </Text>
              </Group>
            )}
            {ticket.category && (
              <Group gap={4}>
                <IconCategory size={14} color={theme.colors.gray[6]} />
                <Text size="xs" c="dimmed">
                  {ticket.category.name}
                </Text>
              </Group>
            )}
          </Group>

          {/* Meta information */}
          <Stack gap="xs" mt="auto">
            <Group justify="apart" align="center">
              <Group gap={6}>
                <IconCalendar size={14} color={theme.colors.gray[6]} />
                <Text size="xs" c="dimmed">
                  {formatDate(new Date(ticket.createdAt))}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" fw={500}>
                {getTimeAgo(ticket.createdAt)}
              </Text>
            </Group>

            {/* Additional info row */}
            <Group justify="apart" align="center">
              <Group gap="xs">
                {hasAttachments && (
                  <Tooltip label={`${ticket.documentIds.length} attachment(s)`}>
                    <Group gap={4}>
                      <IconPaperclip size={12} color={theme.colors.blue[6]} />
                      <Text size="xs" c="blue" fw={500}>
                        {ticket.documentIds.length}
                      </Text>
                    </Group>
                  </Tooltip>
                )}
                <Group gap={4}>
                  <IconMessage size={12} color={theme.colors.gray[6]} />
                  <Text size="xs" c="dimmed">
                    View Details
                  </Text>
                </Group>
              </Group>

              {ticket.assignedToId && (
                <Group gap={4}>
                  <IconUser size={12} color={theme.colors.green[6]} />
                  <Text size="xs" c="green" fw={500}>
                    Assigned
                  </Text>
                </Group>
              )}
            </Group>
          </Stack>
        </Stack>
      </Card>
    );
  };

  // Memoized ticket calculations for performance
  const { activeTickets, closedTickets, allTickets, statistics } =
    useMemo(() => {
      const active = tickets.filter(
        (ticket) =>
          ticket.status === TicketStatus.OPENED ||
          ticket.status === TicketStatus.IN_PROGRESS ||
          ticket.status === TicketStatus.RESOLVED
      );

      const closed = tickets.filter(
        (ticket) => ticket.status === TicketStatus.CLOSED
      );

      const highPriority = tickets.filter(
        (t) =>
          t.priority === TicketPriority.HIGH && t.status !== TicketStatus.CLOSED
      );

      const stats = {
        total: tickets.length,
        active: active.length,
        closed: closed.length,
        highPriority: highPriority.length,
        inProgress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS)
          .length,
        resolved: tickets.filter((t) => t.status === TicketStatus.RESOLVED)
          .length,
      };

      return {
        activeTickets: active,
        closedTickets: closed,
        allTickets: tickets,
        statistics: stats,
      };
    }, [tickets]);

  const renderTicketGrid = (ticketsToRender: Ticket[]) => {
    if (ticketsToRender.length === 0) {
      return (
        <Card withBorder p="xl" radius="md" ta="center">
          <IconTicket
            size={48}
            color={theme.colors.gray[4]}
            style={{ marginBottom: theme.spacing.md }}
          />
          <Text fw={500} mb="sm">
            No tickets found
          </Text>
          <Text c="dimmed" size="sm" mb="lg">
            {activeTab === "active"
              ? "You don't have any active tickets."
              : "You haven't created any tickets yet."}
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
            variant="light"
          >
            {t("tickets:tickets.actions.create")}
          </Button>
        </Card>
      );
    }

    return (
      <Grid>
        {ticketsToRender.map((ticket) => (
          <Grid.Col span={{ base: 12, md: 6 }} key={ticket.id}>
            {renderEnhancedTicketCard(ticket)}
          </Grid.Col>
        ))}
      </Grid>
    );
  };

  if (isLoading) {
    return (
      <Container size="lg">
        <Text ta="center" mt="xl">
          {t("common:loading")}
        </Text>
      </Container>
    );
  }

  // Statistics are now calculated in useMemo above for performance

  return (
    <Container size="xl">
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

      {/* Enhanced Summary Cards */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Group justify="apart" mb="xs">
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Total Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {statistics.total}
                </Text>
              </div>
              <IconTicket size={32} color={theme.colors.blue[6]} />
            </Group>
            <Progress
              value={statistics.total > 0 ? 100 : 0}
              color="blue"
              size="xs"
              mt="sm"
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Group justify="apart" mb="xs">
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Active Tickets
                </Text>
                <Text size="xl" fw={700} c="blue">
                  {statistics.active}
                </Text>
              </div>
              <IconProgress size={32} color={theme.colors.blue[6]} />
            </Group>
            <Progress
              value={
                statistics.total > 0
                  ? (statistics.active / statistics.total) * 100
                  : 0
              }
              color="blue"
              size="xs"
              mt="sm"
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Group justify="apart" mb="xs">
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  High Priority
                </Text>
                <Text size="xl" fw={700} c="red">
                  {statistics.highPriority}
                </Text>
              </div>
              <IconFlag size={32} color={theme.colors.red[6]} />
            </Group>
            <Progress
              value={
                statistics.active > 0
                  ? (statistics.highPriority / statistics.active) * 100
                  : 0
              }
              color="red"
              size="xs"
              mt="sm"
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Group justify="apart" mb="xs">
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Closed
                </Text>
                <Text size="xl" fw={700} c="gray">
                  {statistics.closed}
                </Text>
              </div>
              <IconLock size={32} color={theme.colors.gray[6]} />
            </Group>
            <Progress
              value={
                statistics.total > 0
                  ? (statistics.closed / statistics.total) * 100
                  : 0
              }
              color="gray"
              size="xs"
              mt="sm"
            />
          </Card>
        </Grid.Col>
      </Grid>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="active" leftSection={<IconProgress size={16} />}>
            Active Tickets
            {activeTickets.length > 0 && (
              <Badge ml="xs" size="sm" variant="light">
                {activeTickets.length}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconTicket size={16} />}>
            All Tickets
            {statistics.total > 0 && (
              <Badge ml="xs" size="sm" variant="light">
                {statistics.total}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="closed" leftSection={<IconLock size={16} />}>
            Closed
            {statistics.closed > 0 && (
              <Badge ml="xs" size="sm" variant="light">
                {statistics.closed}
              </Badge>
            )}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md">
          {renderTicketGrid(activeTickets)}
        </Tabs.Panel>

        <Tabs.Panel value="all" pt="md">
          {renderTicketGrid(allTickets)}
        </Tabs.Panel>

        <Tabs.Panel value="closed" pt="md">
          {renderTicketGrid(closedTickets)}
        </Tabs.Panel>
      </Tabs>

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
