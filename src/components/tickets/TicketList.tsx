// src/components/tickets/TicketList.tsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Group,
  ActionIcon,
  Badge,
  Text,
  Card,
  Select,
  Input,
  Grid,
  Paper,
  Button,
  Title,
  MultiSelect,
  Checkbox,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconSearch,
  IconX,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "@/services/api/services/tickets";
import { formatDate } from "@/utils/format-date";
import { QueueSelect } from "./queues/QueueSelect";
import { CategorySelect } from "./categories/CategorySelect";
import { ResponsiveDisplay } from "@/components/responsive-display/ResponsiveDisplay";
import { TicketListMobile } from "./TicketListMobile";
import { TicketFiltersMobile } from "./TicketFiltersMobile";
import { useGetUsersService } from "@/services/api/services/users";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

interface TicketListProps {
  tickets: Ticket[];
  totalCount?: number;
  onViewTicket: (ticketId: string) => void;
  onEditTicket: (ticketId: string) => void;
  onFilterChange: (filters: {
    queueId?: string | null;
    categoryId?: string | null;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    search?: string | null;
    userIds?: string[] | null;
    createdAfter?: Date | null;
    createdBefore?: Date | null;
    unassigned?: boolean;
  }) => void;
  onImmediateSearch?: (searchTerm: string) => void;
  filters: {
    queueId?: string | null;
    categoryId?: string | null;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    search?: string | null;
    userIds?: string[] | null;
    createdAfter?: Date | null;
    createdBefore?: Date | null;
    unassigned?: boolean;
  };
  isLoading: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

// Define consistent column widths to use across the application
const COLUMN_WIDTHS = {
  id: "8%",
  title: "25%",
  queue: "15%",
  category: "15%",
  status: "12%",
  priority: "12%",
  date: "13%",
};

export function TicketList({
  tickets,
  totalCount,
  onViewTicket,
  onFilterChange,
  onImmediateSearch,
  filters,
  isLoading,
  hasNextPage,
  onLoadMore,
  isLoadingMore,
}: TicketListProps) {
  const { t } = useTranslation("tickets");

  // Add local state for the search input
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Fetch users for multi-select
  const [userOptions, setUserOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const getUsersService = useGetUsersService();

  // Load users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const { status, data } = await getUsersService(undefined, {
          page: 1,
          limit: 50,
        });
        if (status === HTTP_CODES_ENUM.OK) {
          const options = data.data.map((user) => ({
            value: user.id.toString(),
            label: `${user.firstName} ${user.lastName} (${user.email})`,
          }));
          setUserOptions(options);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [getUsersService]);

  // Handle user filter change
  const handleUserFilterChange = (selectedUserIds: string[]) => {
    onFilterChange({
      ...filters,
      userIds: selectedUserIds.length > 0 ? selectedUserIds : null,
    });
  };

  // Update searchInput when filters.search changes externally
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  const handleFilterChange = <K extends keyof typeof filters>(
    field: K,
    value: (typeof filters)[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  // Execute search - called by Enter key or search icon click
  const executeSearch = () => {
    const searchTerm = searchInput || null;
    if (onImmediateSearch) {
      // Use immediate search to bypass debouncing
      onImmediateSearch(searchTerm || "");
    } else {
      // Fallback to regular filter change
      onFilterChange({
        ...filters,
        search: searchTerm,
      });
    }
  };

  // Handle search input change (only updates local state)
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  // Handle Enter key down
  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      executeSearch();
    }
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
      unassigned: false,
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
        {t(`tickets:tickets.priorities.${priority}`)}
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
        {t(`tickets:tickets.statuses.${status}`)}
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
  const desktopContent = (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">
        {t("tickets:tickets.ticketList")}
      </Title>

      {/* Search Bar - Isolated */}
      <Paper withBorder p="md" mb="md">
        <Grid>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <Input.Wrapper label={t("tickets:tickets.filters.search")}>
              <div style={{ position: "relative" }}>
                <Input
                  placeholder={t("tickets:tickets.filters.searchPlaceholder")}
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  data-testid="ticket-filter-search"
                  rightSection={
                    <ActionIcon
                      size="sm"
                      variant="filled"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        executeSearch();
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      data-testid="ticket-filter-search-execute"
                      style={{
                        cursor: "pointer",
                        zIndex: 100,
                        position: "relative",
                        pointerEvents: "all",
                      }}
                      aria-label="Search"
                    >
                      <IconSearch size={16} />
                    </ActionIcon>
                  }
                />
              </div>
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <MultiSelect
              label={t("tickets:tickets.filters.userFilter")}
              placeholder={
                isLoadingUsers
                  ? "Loading users..."
                  : t("tickets:tickets.filters.selectUsers")
              }
              data={userOptions}
              value={filters.userIds || []}
              onChange={handleUserFilterChange}
              searchable
              clearable
              disabled={isLoadingUsers}
              data-testid="ticket-filter-users"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper withBorder p="md" mb="md">
        <Grid>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <QueueSelect
              value={filters.queueId || null}
              onChange={(value) => handleFilterChange("queueId", value)}
              label={t("tickets:tickets.filters.queue")}
              placeholder={t("tickets:tickets.filters.anyQueue")}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <CategorySelect
              queueId={filters.queueId || null}
              value={filters.categoryId || null}
              onChange={(value) => handleFilterChange("categoryId", value)}
              label={t("tickets:tickets.filters.category")}
              placeholder={t("tickets:tickets.filters.anyCategory")}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <Select
              label={t("tickets:tickets.filters.status")}
              placeholder={t("tickets:tickets.filters.anyStatus")}
              data={statusOptions}
              value={filters.status || null}
              onChange={(value) =>
                handleFilterChange("status", value as TicketStatus | null)
              }
              clearable
              data-testid="ticket-filter-status"
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <Select
              label={t("tickets:tickets.filters.priority")}
              placeholder={t("tickets:tickets.filters.anyPriority")}
              data={priorityOptions}
              value={filters.priority || null}
              onChange={(value) =>
                handleFilterChange("priority", value as TicketPriority | null)
              }
              clearable
              data-testid="ticket-filter-priority"
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <DateInput
              label={t("tickets:tickets.filters.createdAfter")}
              placeholder={t("tickets:tickets.filters.selectDate")}
              value={filters.createdAfter}
              onChange={(value) => handleFilterChange("createdAfter", value)}
              leftSection={<IconCalendar size={16} />}
              clearable
              data-testid="ticket-filter-created-after"
              size="sm"
              previousIcon={<IconChevronLeft size={16} stroke={2} />}
              nextIcon={<IconChevronRight size={16} stroke={2} />}
              popoverProps={{
                withinPortal: true,
                zIndex: 999999,
                classNames: {
                  dropdown: "date-picker-popover-after",
                },
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <DateInput
              label={t("tickets:tickets.filters.createdBefore")}
              placeholder={t("tickets:tickets.filters.selectDate")}
              value={filters.createdBefore}
              onChange={(value) => handleFilterChange("createdBefore", value)}
              leftSection={<IconCalendar size={16} />}
              clearable
              data-testid="ticket-filter-created-before"
              size="sm"
              previousIcon={<IconChevronLeft size={16} stroke={2} />}
              nextIcon={<IconChevronRight size={16} stroke={2} />}
              popoverProps={{
                withinPortal: true,
                zIndex: 999999,
                classNames: {
                  dropdown: "date-picker-popover-before",
                },
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4 }}>
            <Checkbox
              label={t("tickets:tickets.filters.unassigned")}
              checked={filters.unassigned || false}
              onChange={(event) =>
                handleFilterChange("unassigned", event.currentTarget.checked)
              }
              data-testid="ticket-filter-unassigned"
              mt="xl"
            />
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            leftSection={<IconX size={16} />}
            onClick={handleClearFilters}
            size="compact-sm"
            data-testid="ticket-filter-clear-all"
          >
            {t("tickets:tickets.filters.clearFilters")}
          </Button>
        </Group>
      </Paper>
      {/* Results count */}
      {!isLoading && (
        <Text size="sm" c="dimmed" mb="md">
          {tickets.length > 0
            ? totalCount && totalCount > tickets.length
              ? t("tickets:tickets.showingResultsCount", {
                  showing: tickets.length,
                  total: totalCount,
                })
              : t("tickets:tickets.resultsCount", { count: tickets.length })
            : t("tickets:tickets.noResults")}
        </Text>
      )}
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
              <Table.Th style={{ width: COLUMN_WIDTHS.queue }}>
                {t("tickets:tickets.fields.queue")}
              </Table.Th>
              <Table.Th style={{ width: COLUMN_WIDTHS.category }}>
                {t("tickets:tickets.fields.category")}
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
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tickets.map((ticket) => (
              <Table.Tr
                key={ticket.id}
                style={{ cursor: "pointer" }}
                onClick={() => onViewTicket(ticket.id)}
                data-testid={`ticket-row-${ticket.id}`}
              >
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
                <Table.Td style={{ width: COLUMN_WIDTHS.queue }}>
                  <Text size="sm" lineClamp={1}>
                    {ticket.queue?.name || "-"}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: COLUMN_WIDTHS.category }}>
                  <Text size="sm" lineClamp={1}>
                    {ticket.category?.name || "-"}
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
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      {hasNextPage && !isLoading && (
        <Group justify="center" mt="xl">
          <Button
            onClick={onLoadMore}
            loading={isLoadingMore}
            variant="subtle"
            size="lg"
            data-testid="load-more-tickets"
          >
            {t("common:loadMore")}
          </Button>
        </Group>
      )}
    </Paper>
  );

  // Mobile version with simplified cards
  const mobileContent = (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">
        {t("tickets:tickets.ticketList")}
      </Title>

      {/* Search Bar - Isolated */}
      <Paper withBorder p="md" mb="md">
        <Input.Wrapper label={t("tickets:tickets.filters.search")}>
          <div style={{ position: "relative" }}>
            <Input
              placeholder={t("tickets:tickets.filters.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              data-testid="ticket-filter-search-mobile"
              rightSection={
                <ActionIcon
                  size="sm"
                  variant="filled"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    executeSearch();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  data-testid="ticket-filter-search-execute-mobile"
                  style={{
                    cursor: "pointer",
                    zIndex: 100,
                    position: "relative",
                    pointerEvents: "all",
                  }}
                  aria-label="Search"
                >
                  <IconSearch size={16} />
                </ActionIcon>
              }
            />
          </div>
        </Input.Wrapper>
      </Paper>

      {/* User Filter - Mobile */}
      <Paper withBorder p="md" mb="md">
        <MultiSelect
          label={t("tickets:tickets.filters.userFilter")}
          placeholder={
            isLoadingUsers
              ? "Loading users..."
              : t("tickets:tickets.filters.selectUsers")
          }
          data={userOptions}
          value={filters.userIds || []}
          onChange={handleUserFilterChange}
          searchable
          clearable
          disabled={isLoadingUsers}
          data-testid="ticket-filter-users-mobile"
        />
        <Checkbox
          label={t("tickets:tickets.filters.unassigned")}
          checked={filters.unassigned || false}
          onChange={(event) =>
            onFilterChange({
              ...filters,
              unassigned: event.currentTarget.checked,
            })
          }
          data-testid="ticket-filter-unassigned-mobile"
          mt="md"
        />
      </Paper>

      <TicketFiltersMobile filters={filters} onFilterChange={onFilterChange} />
      {/* Results count */}
      {!isLoading && (
        <Text size="sm" c="dimmed" mb="md">
          {tickets.length > 0
            ? totalCount && totalCount > tickets.length
              ? t("tickets:tickets.showingResultsCount", {
                  showing: tickets.length,
                  total: totalCount,
                })
              : t("tickets:tickets.resultsCount", { count: tickets.length })
            : t("tickets:tickets.noResults")}
        </Text>
      )}
      <TicketListMobile
        tickets={tickets}
        onViewTicket={onViewTicket}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        onLoadMore={onLoadMore}
        isLoadingMore={isLoadingMore}
      />
    </Paper>
  );

  return (
    <ResponsiveDisplay
      desktopContent={desktopContent}
      mobileContent={mobileContent}
    />
  );
}
