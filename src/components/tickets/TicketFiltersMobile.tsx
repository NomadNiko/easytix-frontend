// src/components/tickets/TicketFiltersMobile.tsx
import React from "react";
import { Accordion, Box, Button, Group, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconFilter, IconX, IconCalendar } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { TicketPriority, TicketStatus } from "@/services/api/services/tickets";
import { QueueSelect } from "./queues/QueueSelect";
import { CategorySelect } from "./categories/CategorySelect";

interface TicketFiltersMobileProps {
  filters: {
    queueId?: string | null;
    categoryId?: string | null;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    search?: string | null;
    userIds?: string[] | null;
    createdAfter?: Date | null;
    createdBefore?: Date | null;
  };
  onFilterChange: (filters: {
    queueId?: string | null;
    categoryId?: string | null;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    search?: string | null;
    userIds?: string[] | null;
    createdAfter?: Date | null;
    createdBefore?: Date | null;
  }) => void;
}

export function TicketFiltersMobile({
  filters,
  onFilterChange,
}: TicketFiltersMobileProps) {
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
      categoryId: null,
      status: null,
      priority: null,
      search: null,
      userIds: null,
      createdAfter: null,
      createdBefore: null,
    });
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

  return (
    <Box>
      <Accordion>
        <Accordion.Item value="filters">
          <Accordion.Control icon={<IconFilter size={16} />}>
            {t("tickets:tickets.filters.title")}
          </Accordion.Control>
          <Accordion.Panel>
            <Box mb="sm">
              <QueueSelect
                value={filters.queueId || null}
                onChange={(value) => handleFilterChange("queueId", value)}
                label={t("tickets:tickets.filters.queue")}
                placeholder={t("tickets:tickets.filters.anyQueue")}
              />
            </Box>

            <Box mb="sm">
              <CategorySelect
                queueId={filters.queueId || null}
                value={filters.categoryId || null}
                onChange={(value) => handleFilterChange("categoryId", value)}
                label={t("tickets:tickets.filters.category")}
                placeholder={t("tickets:tickets.filters.anyCategory")}
              />
            </Box>

            <Box mb="sm">
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
            </Box>

            <Box mb="sm">
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
            </Box>

            <Box mb="sm">
              <DateInput
                label={t("tickets:tickets.filters.createdAfter")}
                placeholder={t("tickets:tickets.filters.selectDate")}
                value={filters.createdAfter}
                onChange={(value) => handleFilterChange("createdAfter", value)}
                leftSection={<IconCalendar size={16} />}
                clearable
                size="sm"
              />
            </Box>

            <Box mb="sm">
              <DateInput
                label={t("tickets:tickets.filters.createdBefore")}
                placeholder={t("tickets:tickets.filters.selectDate")}
                value={filters.createdBefore}
                onChange={(value) => handleFilterChange("createdBefore", value)}
                leftSection={<IconCalendar size={16} />}
                clearable
                size="sm"
              />
            </Box>

            <Group justify="right" mt="md">
              <Button
                variant="light"
                leftSection={<IconX size={16} />}
                onClick={handleClearFilters}
                size="compact-sm"
              >
                {t("tickets:tickets.filters.clearFilters")}
              </Button>
            </Group>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
}
