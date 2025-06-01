// src/app/[language]/tickets/page-content.tsx
"use client";
import React, { useState } from "react";
import { Container, Title, Button, Group, Modal, Tabs } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import {
  useTicketsQuery,
  useCreateTicketMutation,
  TicketStatus,
  TicketPriority,
} from "@/app/[language]/tickets/queries/ticket-queries";
import { TicketsPaginatedResponse } from "@/services/api/services/tickets";
import { Ticket } from "@/services/api/services/tickets";
import { TicketForm } from "@/components/tickets/TicketForm";
import { TicketList } from "@/components/tickets/TicketList";
import useLanguage from "@/services/i18n/use-language";

interface TicketFilters {
  queueId: string | null;
  status: TicketStatus | null;
  priority: TicketPriority | null;
  search: string | null;
  assignedToId?: string | null;
  createdById?: string | null;
}

function TicketsPage() {
  const { t } = useTranslation("tickets");
  const router = useRouter();
  const language = useLanguage();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("all");
  const [page, setPage] = useState(1);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);

  // Filters state
  const [filters, setFilters] = useState<TicketFilters>({
    queueId: null,
    status: null,
    priority: null,
    search: null,
  });

  // Debounced search to prevent excessive API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string | null>(
    null
  );

  // Debounce search term updates
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(filters.search);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [filters.search]);

  const createTicketMutation = useCreateTicketMutation();

  // Determine query filters based on active tab and filters state
  const getQueryFilters = React.useCallback(() => {
    const queryFilters: Record<string, string | null> = {};

    // Add base filters
    if (filters.queueId) queryFilters.queueId = filters.queueId;
    if (filters.status) queryFilters.status = filters.status;
    if (filters.priority) queryFilters.priority = filters.priority;
    if (debouncedSearchTerm) queryFilters.search = debouncedSearchTerm;

    // Add tab-specific filters
    if (activeTab === "assigned" && user) {
      queryFilters.assignedToId = user.id.toString();
    } else if (activeTab === "unassigned") {
      queryFilters.assignedToId = "null";
    } else if (activeTab === "created" && user) {
      queryFilters.createdById = user.id.toString();
    } else if (activeTab === "open") {
      queryFilters.status = TicketStatus.OPENED;
    } else if (activeTab === "closed") {
      queryFilters.status = TicketStatus.CLOSED;
    }

    return queryFilters;
  }, [
    filters.queueId,
    filters.status,
    filters.priority,
    debouncedSearchTerm,
    activeTab,
    user,
  ]);

  const queryFilters = React.useMemo(
    () => ({
      ...getQueryFilters(),
      page,
      limit: 20,
    }),
    [getQueryFilters, page]
  );

  const {
    data: ticketsResponse,
    isLoading,
    isFetching,
  } = useTicketsQuery(queryFilters);

  // Safely access the response data
  const ticketsData = React.useMemo(() => {
    return (ticketsResponse as TicketsPaginatedResponse)?.data || [];
  }, [ticketsResponse]);

  const hasNextPage = React.useMemo(() => {
    return (ticketsResponse as TicketsPaginatedResponse)?.hasNextPage || false;
  }, [ticketsResponse]);

  // Update allTickets when new data arrives
  React.useEffect(() => {
    if (ticketsData.length > 0 || page === 1) {
      if (page === 1) {
        setAllTickets(ticketsData);
      } else {
        setAllTickets((prev) => [...prev, ...ticketsData]);
      }
    }
  }, [ticketsData, page]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
    setAllTickets([]);
  }, [
    filters.queueId,
    filters.status,
    filters.priority,
    debouncedSearchTerm,
    activeTab,
  ]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

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

  const handleEditTicket = (ticketId: string) => {
    router.push(`/${language}/tickets/${ticketId}/edit`);
  };

  const handleFilterChange = (newFilters: Partial<TicketFilters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  const handleImmediateSearch = (searchTerm: string) => {
    // For immediate search (Enter key or search icon), bypass debounce
    setDebouncedSearchTerm(searchTerm);
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: searchTerm,
    }));
  };

  return (
    <Container size="xl">
      <Group justify="apart" mb="lg">
        <Title order={2}>{t("tickets:tickets.pageTitle")}</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsCreateModalOpen(true)}
          size="compact-sm"
          data-testid="create-ticket-button"
        >
          {t("tickets:tickets.actions.create")}
        </Button>
      </Group>
      <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
        <Tabs.List>
          <Tabs.Tab value="all">{t("tickets:tickets.tabs.all")}</Tabs.Tab>
          <Tabs.Tab value="assigned">
            {t("tickets:tickets.tabs.assigned")}
          </Tabs.Tab>
          <Tabs.Tab value="unassigned">
            {t("tickets:tickets.tabs.unassigned")}
          </Tabs.Tab>
          <Tabs.Tab value="created">
            {t("tickets:tickets.tabs.created")}
          </Tabs.Tab>
          <Tabs.Tab value="open">{t("tickets:tickets.tabs.open")}</Tabs.Tab>
          <Tabs.Tab value="closed">{t("tickets:tickets.tabs.closed")}</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <TicketList
        tickets={allTickets}
        onViewTicket={handleViewTicket}
        onEditTicket={handleEditTicket}
        onFilterChange={handleFilterChange}
        onImmediateSearch={handleImmediateSearch}
        filters={filters}
        isLoading={isLoading && page === 1}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
        isLoadingMore={isFetching && page > 1}
      />
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

export default TicketsPage;
