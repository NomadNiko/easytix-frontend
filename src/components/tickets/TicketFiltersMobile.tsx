// src/components/tickets/TicketFiltersMobile.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Accordion,
  Box,
  Button,
  Group,
  Select,
  TextInput,
  ActionIcon,
} from "@mantine/core";
import { IconFilter, IconSearch, IconX } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { TicketPriority, TicketStatus } from "@/services/api/services/tickets";
import { QueueSelect } from "./queues/QueueSelect";

interface TicketFiltersMobileProps {
  filters: {
    queueId?: string | null;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    search?: string | null;
  };
  onFilterChange: (filters: {
    queueId?: string | null;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    search?: string | null;
  }) => void;
  // New props for debounced search
  searchInput?: string;
  setSearchInput?: React.Dispatch<React.SetStateAction<string>>;
  handleSearchChange?: (value: string) => void;
}

export function TicketFiltersMobile({
  filters,
  onFilterChange,
  searchInput: propSearchInput,
  setSearchInput: propSetSearchInput,
  handleSearchChange: propHandleSearchChange,
}: TicketFiltersMobileProps) {
  const { t } = useTranslation("tickets");

  // Local state for search input if not provided by parent
  const [localSearchInput, setLocalSearchInput] = useState(
    filters.search || ""
  );
  // Reference to track timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use props or local state
  const searchInput =
    propSearchInput !== undefined ? propSearchInput : localSearchInput;
  const setSearchInput = propSetSearchInput || setLocalSearchInput;

  // Update searchInput when filters.search changes externally
  useEffect(() => {
    if (!propSearchInput) {
      setLocalSearchInput(filters.search || "");
    }
  }, [filters.search, propSearchInput]);

  const handleFilterChange = <K extends keyof typeof filters>(
    field: K,
    value: (typeof filters)[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  // Debounced search function if not provided by parent
  const handleSearchChange =
    propHandleSearchChange ||
    ((value: string) => {
      setLocalSearchInput(value);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        onFilterChange({
          ...filters,
          search: value || null,
        });
      }, 500); // 500ms debounce time
    });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClearFilters = () => {
    onFilterChange({
      queueId: null,
      status: null,
      priority: null,
      search: null,
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
              <TextInput
                label={t("tickets:tickets.filters.search")}
                placeholder={t("tickets:tickets.filters.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                rightSection={
                  searchInput ? (
                    <ActionIcon
                      size="sm"
                      onClick={() => {
                        setSearchInput("");
                        onFilterChange({
                          ...filters,
                          search: null,
                        });
                      }}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  ) : (
                    <IconSearch size={16} />
                  )
                }
                mb="xs"
              />
            </Box>

            <Box mb="sm">
              <QueueSelect
                value={filters.queueId || null}
                onChange={(value) => handleFilterChange("queueId", value)}
                label={t("tickets:tickets.filters.queue")}
                placeholder={t("tickets:tickets.filters.anyQueue")}
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
