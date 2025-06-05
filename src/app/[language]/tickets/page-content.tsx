// src/app/[language]/tickets/page-content.tsx
"use client";
import React, { useState } from "react";
import { Container, Title, Button, Group, Modal } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import {
  useTicketsQuery,
  useCreateTicketMutation,
  TicketPriority,
} from "@/app/[language]/tickets/queries/ticket-queries";
import { TicketsPaginatedResponse } from "@/services/api/services/tickets";
import { Ticket } from "@/services/api/services/tickets";
import { TicketForm } from "@/components/tickets/TicketForm";
import { SimpleTicketList } from "@/components/tickets/SimpleTicketList";
import { UnifiedSearchPanel } from "@/components/tickets/UnifiedSearchPanel";
import useLanguage from "@/services/i18n/use-language";
import {
  SearchCriteria,
  toAPIFormat,
} from "@/services/api/types/search-criteria";

function TicketsPage() {
  const { t } = useTranslation("tickets");
  const router = useRouter();
  const language = useLanguage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);

  // Search criteria state using the unified interface
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    page: 1,
    limit: 20,
  });

  // Debounced search criteria to prevent excessive API calls
  const [debouncedSearchCriteria, setDebouncedSearchCriteria] =
    useState<SearchCriteria>(searchCriteria);

  // Debounce search criteria updates
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchCriteria(searchCriteria);
    }, 300); // 300ms delay for all filters

    return () => {
      clearTimeout(handler);
    };
  }, [searchCriteria]);

  const createTicketMutation = useCreateTicketMutation();

  // Convert search criteria to API format with pagination
  const queryFilters = React.useMemo(() => {
    return {
      ...toAPIFormat(debouncedSearchCriteria),
      page,
      limit: 20,
    };
  }, [debouncedSearchCriteria, page]);

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

  const totalCount = React.useMemo(() => {
    return (ticketsResponse as TicketsPaginatedResponse)?.total || 0;
  }, [ticketsResponse]);

  // Update allTickets when new data arrives
  React.useEffect(() => {
    if (page === 1) {
      // Always replace tickets on page 1 (new filter or reset)
      setAllTickets(ticketsData);
    } else if (ticketsData.length > 0) {
      // Only append if we have data for pagination
      setAllTickets((prev) => [...prev, ...ticketsData]);
    }
  }, [ticketsData, page]);

  // Reset page when debounced search criteria change (actual query change)
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearchCriteria]);

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

  const handleSearchCriteriaChange = (newCriteria: Partial<SearchCriteria>) => {
    setSearchCriteria((prevCriteria) => ({
      ...prevCriteria,
      ...newCriteria,
    }));
  };

  const handleImmediateSearch = (searchTerm: string) => {
    // For immediate search (Enter key or search icon), bypass debounce
    const newCriteria = { ...searchCriteria, search: searchTerm || undefined };
    setSearchCriteria(newCriteria);
    setDebouncedSearchCriteria(newCriteria);
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
      {/* Unified Search Panel */}
      <UnifiedSearchPanel
        searchCriteria={searchCriteria}
        onSearchCriteriaChange={handleSearchCriteriaChange}
        onImmediateSearch={handleImmediateSearch}
        totalCount={totalCount}
      />

      {/* Tickets List */}
      <SimpleTicketList
        tickets={allTickets}
        onViewTicket={handleViewTicket}
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
