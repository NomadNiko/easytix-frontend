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
  Collapse,
  Paper,
  useMantineTheme,
  Divider,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import {
  IconPlus,
  IconEye,
  IconCalendar,
  IconUser,
  IconChevronDown,
  IconChevronRight,
  IconTicket,
  IconCircleCheck,
  IconProgress,
  IconLock,
} from "@tabler/icons-react";
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
  const theme = useMantineTheme();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Collapse states for each status section
  const [openedExpanded, setOpenedExpanded] = useState(true);
  const [inProgressExpanded, setInProgressExpanded] = useState(true);
  const [resolvedExpanded, setResolvedExpanded] = useState(true);
  const [closedExpanded, setClosedExpanded] = useState(false);

  const createTicketMutation = useCreateTicketMutation();

  // Query all user's tickets (no pagination)
  const { data: tickets = [], isLoading: ticketsLoading } = useAllTicketsQuery({
    createdById: user?.id?.toString(),
  });

  // Get accurate statistics for user's tickets
  const { isLoading: statsLoading } = useTicketStatisticsQuery({
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

  const renderTicketCard = (ticket: Ticket) => (
    <Card
      key={ticket.id}
      shadow="xs"
      padding="md"
      radius="md"
      withBorder
      mb="sm"
      style={{
        cursor: "pointer",
        transition: theme.other.transitions.base,
      }}
      onClick={() => handleViewTicket(ticket.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = theme.shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.shadows.xs;
      }}
    >
      <Stack gap="sm">
        <Group justify="apart" align="flex-start">
          <div style={{ flex: 1 }}>
            <Group gap="xs" mb="xs">
              <Text size="xs" c="dimmed">
                #{ticket.id.substring(ticket.id.length - 6)}
              </Text>
              {renderPriorityBadge(ticket.priority)}
              {ticket.category && (
                <Badge size="xs" color="gray" variant="light">
                  {ticket.category.name}
                </Badge>
              )}
            </Group>
            <Title order={5} lineClamp={2} mb="xs">
              {ticket.title}
            </Title>
          </div>
          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            onClick={(e) => {
              e.stopPropagation();
              handleViewTicket(ticket.id);
            }}
          >
            <IconEye size={18} />
          </ActionIcon>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {ticket.details}
        </Text>

        <Group gap="lg" mt="xs">
          <Group gap={theme.other.spacing[4]}>
            <IconCalendar size={theme.other.iconSizes.sm} stroke={1.5} />
            <Text size="xs" c="dimmed">
              {formatDate(new Date(ticket.createdAt))}
            </Text>
          </Group>
          {ticket.assignedToId && (
            <Group gap={theme.other.spacing[4]}>
              <IconUser size={theme.other.iconSizes.sm} stroke={1.5} />
              <Text size="xs" c="dimmed">
                {t("tickets:tickets.fields.assignedTo")}
              </Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Card>
  );

  // Separate tickets by status
  const openedTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.OPENED
  );
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.IN_PROGRESS
  );
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.RESOLVED
  );
  const closedTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.CLOSED
  );

  // Status section component
  const StatusSection = ({
    title,
    tickets,
    expanded,
    onToggle,
    color,
    icon,
  }: {
    title: string;
    tickets: Ticket[];
    expanded: boolean;
    onToggle: () => void;
    color: string;
    icon: React.ReactNode;
  }) => {
    if (tickets.length === 0) return null;

    return (
      <Paper withBorder radius="md" p="md" mb="lg">
        <Group
          justify="apart"
          mb={expanded ? "md" : undefined}
          style={{ cursor: "pointer" }}
          onClick={onToggle}
        >
          <Group>
            <ActionIcon variant="transparent" size="sm">
              {expanded ? (
                <IconChevronDown size={20} />
              ) : (
                <IconChevronRight size={20} />
              )}
            </ActionIcon>
            <Group gap="xs">
              {icon}
              <Title order={4} c={color}>
                {title}
              </Title>
              <Badge color={color} variant="light" size="lg">
                {tickets.length}
              </Badge>
            </Group>
          </Group>
        </Group>

        <Collapse in={expanded}>
          <Divider mb="md" />
          <Stack gap="xs">{tickets.map(renderTicketCard)}</Stack>
        </Collapse>
      </Paper>
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

  const totalTickets = tickets.length;
  const activeTickets =
    openedTickets.length + inProgressTickets.length + resolvedTickets.length;

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
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="lg" radius="md">
            <Group justify="apart">
              <div>
                <Text size="sm" c="dimmed">
                  Total Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {totalTickets}
                </Text>
              </div>
              <IconTicket size={32} color={theme.colors.blue[6]} />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="lg" radius="md">
            <Group justify="apart">
              <div>
                <Text size="sm" c="dimmed">
                  Active
                </Text>
                <Text size="xl" fw={700} c="blue">
                  {activeTickets}
                </Text>
              </div>
              <IconProgress size={32} color={theme.colors.blue[6]} />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="lg" radius="md">
            <Group justify="apart">
              <div>
                <Text size="sm" c="dimmed">
                  Resolved
                </Text>
                <Text size="xl" fw={700} c="green">
                  {resolvedTickets.length}
                </Text>
              </div>
              <IconCircleCheck size={32} color={theme.colors.green[6]} />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="lg" radius="md">
            <Group justify="apart">
              <div>
                <Text size="sm" c="dimmed">
                  Closed
                </Text>
                <Text size="xl" fw={700} c="gray">
                  {closedTickets.length}
                </Text>
              </div>
              <IconLock size={32} color={theme.colors.gray[6]} />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Status Sections */}
      <StatusSection
        title={t("tickets:tickets.statuses.opened")}
        tickets={openedTickets}
        expanded={openedExpanded}
        onToggle={() => setOpenedExpanded(!openedExpanded)}
        color="blue"
        icon={<IconTicket size={20} color={theme.colors.blue[6]} />}
      />

      <StatusSection
        title={t("tickets:tickets.statuses.inProgress")}
        tickets={inProgressTickets}
        expanded={inProgressExpanded}
        onToggle={() => setInProgressExpanded(!inProgressExpanded)}
        color="yellow"
        icon={<IconProgress size={20} color={theme.colors.yellow[6]} />}
      />

      <StatusSection
        title={t("tickets:tickets.statuses.resolved")}
        tickets={resolvedTickets}
        expanded={resolvedExpanded}
        onToggle={() => setResolvedExpanded(!resolvedExpanded)}
        color="green"
        icon={<IconCircleCheck size={20} color={theme.colors.green[6]} />}
      />

      <StatusSection
        title={t("tickets:tickets.statuses.closed")}
        tickets={closedTickets}
        expanded={closedExpanded}
        onToggle={() => setClosedExpanded(!closedExpanded)}
        color="gray"
        icon={<IconLock size={20} color={theme.colors.gray[6]} />}
      />

      {/* Empty State */}
      {tickets && tickets.length === 0 && (
        <Card withBorder p="xl" radius="md" ta="center">
          <IconTicket
            size={48}
            color={theme.colors.gray[4]}
            style={{ marginBottom: theme.spacing.md }}
          />
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
