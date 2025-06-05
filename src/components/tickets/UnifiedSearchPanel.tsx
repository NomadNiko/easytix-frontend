// src/components/tickets/UnifiedSearchPanel.tsx
"use client";
import React, { useState } from "react";
import {
  Paper,
  Group,
  Stack,
  TextInput,
  Button,
  Grid,
  Checkbox,
  MultiSelect,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconSearch,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import {
  SearchCriteria,
  isEmptySearch,
  getSearchDescription,
} from "@/services/api/types/search-criteria";
import { TicketStatus, TicketPriority } from "@/services/api/services/tickets";
import { useQueuesQuery } from "@/app/[language]/tickets/queries/queue-queries";
import { useCategoriesQuery } from "@/app/[language]/tickets/queries/category-queries";

interface UnifiedSearchPanelProps {
  searchCriteria: SearchCriteria;
  onSearchCriteriaChange: (criteria: Partial<SearchCriteria>) => void;
  onImmediateSearch: (search: string) => void;
  totalCount?: number;
}

export function UnifiedSearchPanel({
  searchCriteria,
  onSearchCriteriaChange,
  onImmediateSearch,
  totalCount = 0,
}: UnifiedSearchPanelProps) {
  const { t } = useTranslation("tickets");
  const [searchTerm, setSearchTerm] = useState(searchCriteria.search || "");

  // Load queues and categories for filter options
  const { data: queuesData } = useQueuesQuery(1, 100, undefined, true);
  const { data: categories = [] } = useCategoriesQuery(1, 100, undefined, true);

  // Extract queues array from response
  const queues = Array.isArray(queuesData)
    ? queuesData
    : queuesData?.data || [];

  // Convert data to select options
  const queueOptions = queues.map((queue) => ({
    value: queue.id,
    label: queue.name,
  }));

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const statusOptions = [
    { value: TicketStatus.OPENED, label: t("tickets:tickets.statuses.opened") },
    {
      value: TicketStatus.IN_PROGRESS,
      label: t("tickets:tickets.statuses.inProgress"),
    },
    {
      value: TicketStatus.RESOLVED,
      label: t("tickets:tickets.statuses.resolved"),
    },
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchCriteriaChange({ search: value || undefined });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onImmediateSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    onSearchCriteriaChange({
      search: undefined,
      queueIds: undefined,
      categoryIds: undefined,
      statuses: undefined,
      priorities: undefined,
      unassigned: undefined,
      createdAfter: undefined,
      createdBefore: undefined,
      hasDocuments: undefined,
      hasComments: undefined,
    });
  };

  const hasActiveFilters = !isEmptySearch(searchCriteria);
  const searchDescription = hasActiveFilters
    ? getSearchDescription(searchCriteria)
    : "";

  return (
    <Paper shadow="sm" p="md" mb="lg">
      <Stack gap="md">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit}>
          <Group gap="xs">
            <TextInput
              placeholder={t("tickets:tickets.search.placeholder")}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyPress}
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1 }}
              size="sm"
              data-testid="unified-search-input"
            />
            <Button
              type="submit"
              size="sm"
              variant="filled"
              data-testid="search-submit-button"
            >
              {t("tickets:tickets.search.search")}
            </Button>
          </Group>
        </form>

        {/* Results Summary */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            {hasActiveFilters && (
              <>
                {t("tickets:tickets.search.showing")} {totalCount}{" "}
                {t("tickets:tickets.search.resultsFor")}: {searchDescription}
              </>
            )}
            {!hasActiveFilters && (
              <>
                {t("tickets:tickets.search.showing")} {totalCount}{" "}
                {t("tickets:tickets.search.allTickets")}
              </>
            )}
          </Text>
          {hasActiveFilters && (
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconX size={12} />}
              onClick={handleClearAllFilters}
            >
              {t("tickets:tickets.search.clearAll")}
            </Button>
          )}
        </Group>

        {/* Advanced Filters - Always Visible */}
        <Stack gap="md">
          <Grid>
            {/* Organizational Filters */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MultiSelect
                label={t("tickets:tickets.filters.queues")}
                placeholder={t("tickets:tickets.filters.selectQueues")}
                data={queueOptions}
                value={searchCriteria.queueIds || []}
                onChange={(value) =>
                  onSearchCriteriaChange({
                    queueIds: value.length > 0 ? value : undefined,
                  })
                }
                clearable
                size="sm"
                data-testid="queue-filter"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MultiSelect
                label={t("tickets:tickets.filters.categories")}
                placeholder={t("tickets:tickets.filters.selectCategories")}
                data={categoryOptions}
                value={searchCriteria.categoryIds || []}
                onChange={(value) =>
                  onSearchCriteriaChange({
                    categoryIds: value.length > 0 ? value : undefined,
                  })
                }
                clearable
                size="sm"
                data-testid="category-filter"
              />
            </Grid.Col>

            {/* Status and Priority */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MultiSelect
                label={t("tickets:tickets.filters.status")}
                placeholder={t("tickets:tickets.filters.selectStatuses")}
                data={statusOptions}
                value={searchCriteria.statuses || []}
                onChange={(value) =>
                  onSearchCriteriaChange({
                    statuses:
                      value.length > 0 ? (value as TicketStatus[]) : undefined,
                  })
                }
                clearable
                size="sm"
                data-testid="status-filter"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MultiSelect
                label={t("tickets:tickets.filters.priority")}
                placeholder={t("tickets:tickets.filters.selectPriorities")}
                data={priorityOptions}
                value={searchCriteria.priorities || []}
                onChange={(value) =>
                  onSearchCriteriaChange({
                    priorities:
                      value.length > 0
                        ? (value as TicketPriority[])
                        : undefined,
                  })
                }
                clearable
                size="sm"
                data-testid="priority-filter"
              />
            </Grid.Col>

            {/* Date Filters */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={t("tickets:tickets.filters.createdAfter")}
                placeholder={t("tickets:tickets.filters.selectDate")}
                value={searchCriteria.createdAfter}
                onChange={(value) =>
                  onSearchCriteriaChange({ createdAfter: value || undefined })
                }
                leftSection={<IconCalendar size={16} />}
                clearable
                size="sm"
                previousIcon={<IconChevronLeft size={16} stroke={2} />}
                nextIcon={<IconChevronRight size={16} stroke={2} />}
                data-testid="created-after-filter"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={t("tickets:tickets.filters.createdBefore")}
                placeholder={t("tickets:tickets.filters.selectDate")}
                value={searchCriteria.createdBefore}
                onChange={(value) =>
                  onSearchCriteriaChange({
                    createdBefore: value || undefined,
                  })
                }
                leftSection={<IconCalendar size={16} />}
                clearable
                size="sm"
                previousIcon={<IconChevronLeft size={16} stroke={2} />}
                nextIcon={<IconChevronRight size={16} stroke={2} />}
                data-testid="created-before-filter"
              />
            </Grid.Col>

            {/* Advanced Options */}
            <Grid.Col span={12}>
              <Group gap="lg">
                <Checkbox
                  label={t("tickets:tickets.filters.unassigned")}
                  checked={searchCriteria.unassigned || false}
                  onChange={(e) =>
                    onSearchCriteriaChange({
                      unassigned: e.target.checked ? true : undefined,
                    })
                  }
                  size="sm"
                  data-testid="unassigned-filter"
                />
                <Checkbox
                  label={t("tickets:tickets.filters.hasDocuments")}
                  checked={searchCriteria.hasDocuments || false}
                  onChange={(e) =>
                    onSearchCriteriaChange({
                      hasDocuments: e.target.checked ? true : undefined,
                    })
                  }
                  size="sm"
                  data-testid="has-documents-filter"
                />
                <Checkbox
                  label={t("tickets:tickets.filters.hasComments")}
                  checked={searchCriteria.hasComments || false}
                  onChange={(e) =>
                    onSearchCriteriaChange({
                      hasComments: e.target.checked ? true : undefined,
                    })
                  }
                  size="sm"
                  data-testid="has-comments-filter"
                />
              </Group>
            </Grid.Col>
          </Grid>
        </Stack>
      </Stack>
    </Paper>
  );
}
