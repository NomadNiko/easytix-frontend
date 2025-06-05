"use client";

import React, { useState, useMemo } from "react";
import {
  Container,
  Title,
  Tabs,
  Group,
  Paper,
  Text,
  Grid,
  Select,
  Button,
  Stack,
  Badge,
  Box,
  LoadingOverlay,
  Alert,
  SimpleGrid,
  Card,
  Progress,
  ThemeIcon,
  RingProgress,
  Center,
  ActionIcon,
  Tooltip,
  SegmentedControl,
  Table,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconReportAnalytics,
  IconTrendingUp,
  IconUsers,
  IconBuildingStore,
  IconClock,
  IconChartBar,
  IconInfoCircle,
  IconCalendar,
  IconFilter,
  IconCircleCheck,
  IconProgress,
  IconFileDownload,
} from "@tabler/icons-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "@/services/i18n/client";
import { useQueuesQuery } from "@/app/[language]/tickets/queries/queue-queries";
import {
  useAnalyticsOverviewQuery,
  useVolumeTrendsQuery,
  useStatusFlowAnalyticsQuery,
  usePeakHoursAnalyticsQuery,
  useUserPerformanceQuery,
} from "./queries/analytics-queries";
import { AnalyticsQueryParams } from "@/services/api/services/tickets";
import { useThemeColors } from "@/hooks/use-theme-colors";

// Now using centralized theme colors

function ReportsPageContent() {
  const { t } = useTranslation("reports");
  const colors = useThemeColors();

  // State for filters
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    new Date(),
  ]);
  const [selectedQueues, setSelectedQueues] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [trendPeriod, setTrendPeriod] = useState<string>("daily");

  // Queries
  const { data: queuesData } = useQueuesQuery(1, 100, undefined, true);

  // Format analytics filters
  const analyticsFilters = useMemo((): AnalyticsQueryParams => {
    const filters: AnalyticsQueryParams = {};

    if (dateRange[0]) {
      filters.createdAfter = dateRange[0].toISOString();
    }
    if (dateRange[1]) {
      filters.createdBefore = dateRange[1].toISOString();
    }
    if (selectedQueues.length > 0) {
      filters.queueIds = selectedQueues;
    }

    return filters;
  }, [dateRange, selectedQueues]);

  // Analytics data queries
  const analyticsQuery = useAnalyticsOverviewQuery(analyticsFilters, {
    enabled: true,
  });

  const volumeTrendsQuery = useVolumeTrendsQuery(
    { ...analyticsFilters, period: trendPeriod },
    {
      enabled: activeTab === "trends",
    }
  );

  const statusFlowQuery = useStatusFlowAnalyticsQuery(analyticsFilters, {
    enabled: activeTab === "flow",
  });

  const peakHoursQuery = usePeakHoursAnalyticsQuery(analyticsFilters, {
    enabled: activeTab === "trends",
  });

  const userPerformanceQuery = useUserPerformanceQuery(analyticsFilters, {
    enabled: activeTab === "performance",
  });

  const queueOptions = useMemo(() => {
    if (!queuesData?.data) return [];
    return queuesData.data.map((queue) => ({
      value: queue.id,
      label: queue.name,
    }));
  }, [queuesData]);

  const handleResetFilters = () => {
    setDateRange([
      new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
      new Date(),
    ]);
    setSelectedQueues([]);
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days}d`;
    }
    return `${days}d ${remainingHours.toFixed(0)}h`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat().format(value);
  };

  const isLoading = analyticsQuery.isLoading;
  const error = analyticsQuery.error;

  // Prepare data for charts
  const preparePriorityData = () => {
    if (!analyticsQuery.statistics.data) return [];
    const data = analyticsQuery.statistics.data.byPriority;

    return Object.entries(data)
      .filter(([, value]) => value > 0)
      .map(([priority, count]) => ({
        name: t(`priority.${priority}`),
        value: count,
        color: colors.getPriorityColor(priority as "high" | "medium" | "low"),
      }));
  };

  const prepareQueueDistributionData = () => {
    if (!analyticsQuery.queuePerformance.data) return [];

    return analyticsQuery.queuePerformance.data.slice(0, 5).map((queue) => ({
      name: queue.queueName,
      total: queue.totalTickets,
      open: queue.openTickets,
      inProgress: queue.inProgressTickets,
      resolved: queue.resolvedTickets,
      closed: queue.closedTickets,
    }));
  };

  const prepareTrendData = () => {
    if (!volumeTrendsQuery.data) return [];

    const data =
      trendPeriod === "daily"
        ? volumeTrendsQuery.data.daily
        : trendPeriod === "weekly"
          ? volumeTrendsQuery.data.weekly
          : volumeTrendsQuery.data.monthly;

    return data.map((item) => ({
      date:
        "date" in item
          ? new Date(item.date).toLocaleDateString()
          : "weekStart" in item
            ? new Date(item.weekStart).toLocaleDateString()
            : item.month,
      created: item.created,
      resolved: item.resolved,
      closed: item.closed,
    }));
  };

  const exportToCSV = () => {
    // Prepare data for export
    const exportData: Record<string, string | number>[] = [];

    // Add overview data
    if (analyticsQuery.statistics.data) {
      exportData.push({
        category: "Overview",
        metric: "Total Tickets",
        value: analyticsQuery.statistics.data.total,
      });
      exportData.push({
        category: "Overview",
        metric: "Open Tickets",
        value: analyticsQuery.statistics.data.open,
      });
      exportData.push({
        category: "Overview",
        metric: "Closed Tickets",
        value: analyticsQuery.statistics.data.closed,
      });
    }

    // Add priority data
    if (analyticsQuery.resolutionTime.data?.byPriority) {
      Object.entries(analyticsQuery.resolutionTime.data.byPriority).forEach(
        ([priority, data]) => {
          if (data) {
            exportData.push({
              category: "Priority",
              metric: `${priority} Priority Tickets`,
              value: data.ticketCount,
              avgResolutionTime: formatDuration(
                data.averageResolutionTimeHours
              ),
            });
          }
        }
      );
    }

    // Add user performance data
    if (analyticsQuery.userPerformance.data) {
      analyticsQuery.userPerformance.data.forEach((user) => {
        exportData.push({
          category: "User Performance",
          metric: user.userName,
          assigned: user.totalAssigned,
          resolved: user.totalResolved,
          resolutionRate: formatPercentage(user.resolutionRate),
          avgResolutionTime: formatDuration(user.averageResolutionTimeHours),
        });
      });
    }

    // Convert to CSV
    if (exportData.length === 0) {
      return;
    }

    const headers = Object.keys(exportData[0]);
    const csv = [
      headers.join(","),
      ...exportData.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `easytix-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={1}>{t("pageTitle")}</Title>
        <Tooltip label={t("actions.export")}>
          <ActionIcon variant="light" size="lg" onClick={exportToCSV}>
            <IconFileDownload size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Filters Section */}
      <Paper withBorder p="md" mb="lg">
        <Group align="flex-end" gap="md" wrap="wrap">
          <Group gap="sm" align="center">
            <IconFilter size={16} />
            <Text size="sm" fw={500}>
              {t("filters.title")}
            </Text>
          </Group>

          <Box hiddenFrom="sm" style={{ width: "100%" }}>
            <Stack gap="sm">
              <DatePickerInput
                type="range"
                label={t("filters.dateRange")}
                placeholder={t("filters.selectDateRange")}
                value={dateRange}
                onChange={setDateRange}
                clearable
                leftSection={<IconCalendar size={16} />}
                maxDate={new Date()}
              />

              <Select
                label={t("filters.queues")}
                placeholder={t("filters.selectQueues")}
                data={queueOptions}
                value={selectedQueues.length === 1 ? selectedQueues[0] : null}
                onChange={(value) => setSelectedQueues(value ? [value] : [])}
                searchable
                clearable
                multiple
              />

              <Button
                variant="light"
                onClick={handleResetFilters}
                size="sm"
                fullWidth
              >
                {t("filters.reset")}
              </Button>
            </Stack>
          </Box>

          <Box
            visibleFrom="sm"
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap", flex: 1 }}
          >
            <DatePickerInput
              type="range"
              label={t("filters.dateRange")}
              placeholder={t("filters.selectDateRange")}
              value={dateRange}
              onChange={setDateRange}
              clearable
              leftSection={<IconCalendar size={16} />}
              maxDate={new Date()}
              style={{ minWidth: "300px" }}
            />

            <Select
              label={t("filters.queues")}
              placeholder={t("filters.selectQueues")}
              data={queueOptions}
              value={selectedQueues.length === 1 ? selectedQueues[0] : null}
              onChange={(value) => setSelectedQueues(value ? [value] : [])}
              searchable
              clearable
              multiple
              style={{ minWidth: "200px" }}
            />

            <Button
              variant="light"
              onClick={handleResetFilters}
              style={{ alignSelf: "flex-end" }}
            >
              {t("filters.reset")}
            </Button>
          </Box>
        </Group>
      </Paper>

      {/* Error State */}
      {error && (
        <Alert
          icon={<IconInfoCircle size="1rem" />}
          title={t("error.title")}
          color="red"
          mb="lg"
        >
          {t("error.message")}
        </Alert>
      )}

      {/* Main Content */}
      <Box pos="relative">
        <LoadingOverlay visible={isLoading} />

        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value || "dashboard")}
        >
          <Tabs.List>
            <Tabs.Tab
              value="dashboard"
              leftSection={<IconReportAnalytics size={16} />}
            >
              {t("tabs.dashboard")}
            </Tabs.Tab>
            <Tabs.Tab value="trends" leftSection={<IconTrendingUp size={16} />}>
              {t("tabs.trends")}
            </Tabs.Tab>
            <Tabs.Tab value="performance" leftSection={<IconUsers size={16} />}>
              {t("tabs.performance")}
            </Tabs.Tab>
            <Tabs.Tab
              value="queues"
              leftSection={<IconBuildingStore size={16} />}
            >
              {t("tabs.queues")}
            </Tabs.Tab>
            <Tabs.Tab value="flow" leftSection={<IconProgress size={16} />}>
              {t("tabs.flow")}
            </Tabs.Tab>
          </Tabs.List>

          {/* Dashboard Tab */}
          <Tabs.Panel value="dashboard" pt="lg">
            <Stack gap="lg">
              {/* Key Metrics Cards */}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                <Card withBorder p="md">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text size="sm" c="dimmed" mb={4}>
                        {t("metrics.totalTickets")}
                      </Text>
                      <Text size="xl" fw={700}>
                        {formatNumber(
                          analyticsQuery.statistics.data?.total || 0
                        )}
                      </Text>
                    </div>
                    <ThemeIcon
                      color="blue"
                      variant="light"
                      radius="xl"
                      size="xl"
                    >
                      <IconChartBar size={28} />
                    </ThemeIcon>
                  </Group>
                </Card>

                <Card withBorder p="md">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text size="sm" c="dimmed" mb={4}>
                        {t("metrics.averageResolutionTime")}
                      </Text>
                      <Text size="xl" fw={700}>
                        {analyticsQuery.resolutionTime.data?.overall
                          ?.averageResolutionTimeHours
                          ? formatDuration(
                              analyticsQuery.resolutionTime.data.overall
                                .averageResolutionTimeHours
                            )
                          : "N/A"}
                      </Text>
                    </div>
                    <ThemeIcon
                      color="green"
                      variant="light"
                      radius="xl"
                      size="xl"
                    >
                      <IconClock size={28} />
                    </ThemeIcon>
                  </Group>
                </Card>

                <Card withBorder p="md">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text size="sm" c="dimmed" mb={4}>
                        {t("metrics.resolutionRate")}
                      </Text>
                      <Text size="xl" fw={700}>
                        {analyticsQuery.queuePerformance.data &&
                        analyticsQuery.queuePerformance.data.length > 0
                          ? formatPercentage(
                              analyticsQuery.queuePerformance.data.reduce(
                                (acc, queue) => acc + queue.resolutionRate,
                                0
                              ) / analyticsQuery.queuePerformance.data.length
                            )
                          : "0.0%"}
                      </Text>
                    </div>
                    <ThemeIcon
                      color="orange"
                      variant="light"
                      radius="xl"
                      size="xl"
                    >
                      <IconCircleCheck size={28} />
                    </ThemeIcon>
                  </Group>
                </Card>

                <Card withBorder p="md">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text size="sm" c="dimmed" mb={4}>
                        {t("metrics.activeAgents")}
                      </Text>
                      <Text size="xl" fw={700}>
                        {analyticsQuery.userPerformance.data?.length || 0}
                      </Text>
                    </div>
                    <ThemeIcon
                      color="purple"
                      variant="light"
                      radius="xl"
                      size="xl"
                    >
                      <IconUsers size={28} />
                    </ThemeIcon>
                  </Group>
                </Card>
              </SimpleGrid>

              {/* Charts Row */}
              <Grid>
                {/* Priority Distribution */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card withBorder p="md" h={400}>
                    <Text size="lg" fw={600} mb="md">
                      {t("charts.priorityDistribution")}
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={preparePriorityData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {preparePriorityData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid.Col>

                {/* Queue Distribution */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card withBorder p="md" h={400}>
                    <Text size="lg" fw={600} mb="md">
                      {t("charts.queueDistribution")}
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={prepareQueueDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar
                          dataKey="open"
                          stackId="a"
                          fill={colors.getStatusColor("opened")}
                        />
                        <Bar
                          dataKey="inProgress"
                          stackId="a"
                          fill={colors.getStatusColor("inProgress")}
                        />
                        <Bar
                          dataKey="resolved"
                          stackId="a"
                          fill={colors.getStatusColor("resolved")}
                        />
                        <Bar
                          dataKey="closed"
                          stackId="a"
                          fill={colors.getStatusColor("closed")}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid.Col>
              </Grid>

              {/* Resolution Time by Priority */}
              {analyticsQuery.resolutionTime.data?.byPriority && (
                <Card withBorder p="md">
                  <Text size="lg" fw={600} mb="md">
                    {t("sections.resolutionByPriority")}
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    {Object.entries(
                      analyticsQuery.resolutionTime.data.byPriority
                    ).map(([priority, data]) => {
                      if (!data) return null;

                      // Calculate total tickets from all priorities
                      const totalTickets = analyticsQuery.resolutionTime.data
                        ? Object.values(
                            analyticsQuery.resolutionTime.data.byPriority
                          ).reduce(
                            (sum, priority) =>
                              sum + (priority?.ticketCount || 0),
                            0
                          )
                        : 0;

                      const percentage =
                        totalTickets > 0
                          ? (data.ticketCount / totalTickets) * 100
                          : 0;

                      return (
                        <Card key={priority} withBorder p="md">
                          <Group justify="space-between" mb="md">
                            <Badge
                              color={
                                priority === "high"
                                  ? "red"
                                  : priority === "medium"
                                    ? "yellow"
                                    : "green"
                              }
                              variant="filled"
                              size="lg"
                            >
                              {t(`priority.${priority}`)}
                            </Badge>
                            <Text size="xl" fw={700}>
                              {data.ticketCount}
                            </Text>
                          </Group>

                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">
                                {t("metrics.avgTime")}
                              </Text>
                              <Text size="sm" fw={500}>
                                {formatDuration(
                                  data.averageResolutionTimeHours
                                )}
                              </Text>
                            </Group>

                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">
                                {t("metrics.tickets")}
                              </Text>
                              <Text size="sm" fw={500}>
                                {data.ticketCount}
                              </Text>
                            </Group>

                            <Progress
                              value={percentage}
                              color={colors.getPriorityMantineColor(
                                priority as "high" | "medium" | "low"
                              )}
                              size="sm"
                              mt="xs"
                            />
                            <Text size="xs" c="dimmed" ta="center">
                              {formatPercentage(percentage)}{" "}
                              {t("metrics.ofTotal")}
                            </Text>
                          </Stack>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Trends Tab */}
          <Tabs.Panel value="trends" pt="lg">
            <Stack gap="lg">
              {/* Period Selector */}
              <Group justify="space-between">
                <Text size="lg" fw={600}>
                  {t("sections.volumeTrends")}
                </Text>
                <SegmentedControl
                  value={trendPeriod}
                  onChange={setTrendPeriod}
                  data={[
                    { label: t("periods.daily"), value: "daily" },
                    { label: t("periods.weekly"), value: "weekly" },
                    { label: t("periods.monthly"), value: "monthly" },
                  ]}
                />
              </Group>

              {volumeTrendsQuery.data && (
                <Card withBorder p="md">
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={prepareTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="created"
                        stackId="1"
                        stroke={colors.brand.charts.primary}
                        fill={colors.brand.charts.primary}
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        stackId="2"
                        stroke={colors.brand.charts.secondary}
                        fill={colors.brand.charts.secondary}
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="closed"
                        stackId="3"
                        stroke={colors.brand.charts.accent1}
                        fill={colors.brand.charts.accent1}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Peak Hours Analysis */}
              {peakHoursQuery.data ? (
                <Stack gap="lg">
                  {/* Hourly Peak Analysis */}
                  <Card withBorder p="md">
                    <Text size="lg" fw={600} mb="md">
                      {t("charts.hourlyPeakAnalysis")}
                    </Text>
                    <Text size="sm" c="dimmed" mb="md">
                      Peak hour: {peakHoursQuery.data.peakHour}:00 (
                      {peakHoursQuery.data.hourlyData.find(
                        (h) => h.hour === peakHoursQuery.data!.peakHour
                      )?.ticketCount || 0}{" "}
                      tickets)
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={peakHoursQuery.data.hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="hour"
                          tickFormatter={(hour) => `${hour}:00`}
                        />
                        <YAxis />
                        <RechartsTooltip
                          labelFormatter={(hour) => `${hour}:00`}
                          formatter={(value) => [value, "Tickets"]}
                        />
                        <Bar
                          dataKey="ticketCount"
                          fill={colors.brand.charts.primary}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Daily Peak Analysis */}
                  <Card withBorder p="md">
                    <Text size="lg" fw={600} mb="md">
                      {t("charts.dailyPeakAnalysis")}
                    </Text>
                    <Text size="sm" c="dimmed" mb="md">
                      Peak day: {peakHoursQuery.data.peakDay} (
                      {peakHoursQuery.data.dailyData.find(
                        (d) => d.dayName === peakHoursQuery.data!.peakDay
                      )?.ticketCount || 0}{" "}
                      tickets)
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={peakHoursQuery.data.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dayName" />
                        <YAxis />
                        <RechartsTooltip
                          formatter={(value) => [value, "Tickets"]}
                        />
                        <Bar
                          dataKey="ticketCount"
                          fill={colors.brand.charts.secondary}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Stack>
              ) : (
                <Card withBorder p="md">
                  <Text size="lg" fw={600} mb="md">
                    {t("charts.peakHours")}
                  </Text>
                  <Text c="dimmed" ta="center" py="xl">
                    {peakHoursQuery.isLoading
                      ? t("loading")
                      : t("empty.noData")}
                  </Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Performance Tab */}
          <Tabs.Panel value="performance" pt="lg">
            {userPerformanceQuery.data &&
            userPerformanceQuery.data.length > 0 ? (
              <Stack gap="lg">
                {/* Top Performers */}
                <Card withBorder p="md">
                  <Text size="lg" fw={600} mb="md">
                    {t("sections.topPerformers")}
                  </Text>
                  {userPerformanceQuery.data &&
                  userPerformanceQuery.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        width={800}
                        height={400}
                        data={userPerformanceQuery.data
                          .slice(0, 10)
                          .map((user) => ({
                            name: user.userName,
                            resolved: user.totalResolved,
                            assigned: user.totalAssigned,
                          }))}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar
                          dataKey="assigned"
                          fill="#8884d8"
                          name="Assigned"
                        />
                        <Bar
                          dataKey="resolved"
                          fill="#82ca9d"
                          name="Resolved"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Text c="dimmed" ta="center" py="xl">
                      {userPerformanceQuery.isLoading
                        ? "Loading..."
                        : "No performance data available"}
                    </Text>
                  )}
                </Card>

                {/* Detailed Performance Table */}
                <Card withBorder p="md">
                  <Text size="lg" fw={600} mb="md">
                    {t("sections.detailedPerformance")}
                  </Text>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t("table.agent")}</Table.Th>
                        <Table.Th ta="center">{t("table.assigned")}</Table.Th>
                        <Table.Th ta="center">{t("table.resolved")}</Table.Th>
                        <Table.Th ta="center">{t("table.inProgress")}</Table.Th>
                        <Table.Th ta="center">
                          {t("table.avgResolutionTime")}
                        </Table.Th>
                        <Table.Th ta="center">
                          {t("table.resolutionRate")}
                        </Table.Th>
                        <Table.Th ta="center">{t("table.last7Days")}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {userPerformanceQuery.data.map((user) => (
                        <Table.Tr key={user.userId}>
                          <Table.Td fw={500}>{user.userName}</Table.Td>
                          <Table.Td ta="center">{user.totalAssigned}</Table.Td>
                          <Table.Td ta="center">{user.totalResolved}</Table.Td>
                          <Table.Td ta="center">
                            {user.totalInProgress}
                          </Table.Td>
                          <Table.Td ta="center">
                            {formatDuration(user.averageResolutionTimeHours)}
                          </Table.Td>
                          <Table.Td ta="center">
                            <Badge color="blue" variant="light">
                              {formatPercentage(user.resolutionRate)}
                            </Badge>
                          </Table.Td>
                          <Table.Td ta="center">
                            {user.ticketsResolvedLast7Days}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              </Stack>
            ) : (
              <Card withBorder p="md">
                <Stack gap="md" align="center" py="xl">
                  <Text size="lg" fw={600}>
                    {t("sections.userPerformance")}
                  </Text>
                  <Text c="dimmed" ta="center">
                    {t("empty.noData")}
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Performance analytics will be available once tickets are
                    assigned and resolved.
                  </Text>
                </Stack>
              </Card>
            )}
          </Tabs.Panel>

          {/* Queues Tab */}
          <Tabs.Panel value="queues" pt="lg">
            {analyticsQuery.queuePerformance.data ? (
              <Stack gap="md">
                {analyticsQuery.queuePerformance.data.map((queue) => (
                  <Card key={queue.queueId} withBorder p="md">
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 8 }}>
                        <Group justify="space-between" mb="md">
                          <Text size="lg" fw={600}>
                            {queue.queueName}
                          </Text>
                          <Badge color="green" variant="filled" size="lg">
                            {formatPercentage(queue.resolutionRate)}{" "}
                            {t("metrics.resolved")}
                          </Badge>
                        </Group>

                        <SimpleGrid
                          cols={{ base: 2, sm: 4 }}
                          spacing="md"
                          mb="md"
                        >
                          <Box>
                            <Text size="sm" c="dimmed">
                              {t("metrics.total")}
                            </Text>
                            <Text size="xl" fw={700}>
                              {queue.totalTickets}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="sm" c="dimmed">
                              {t("metrics.open")}
                            </Text>
                            <Text
                              size="xl"
                              fw={700}
                              c={colors.getStatusColor("opened")}
                            >
                              {queue.openTickets}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="sm" c="dimmed">
                              {t("metrics.inProgress")}
                            </Text>
                            <Text
                              size="xl"
                              fw={700}
                              c={colors.getStatusColor("inProgress")}
                            >
                              {queue.inProgressTickets}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="sm" c="dimmed">
                              {t("metrics.avgTime")}
                            </Text>
                            <Text size="xl" fw={700}>
                              {formatDuration(queue.averageResolutionTimeHours)}
                            </Text>
                          </Box>
                        </SimpleGrid>

                        {/* Category Breakdown */}
                        {queue.categoryBreakdown &&
                          queue.categoryBreakdown.length > 0 && (
                            <Box>
                              <Text size="sm" fw={500} mb="xs">
                                {t("sections.categoryBreakdown")}
                              </Text>
                              <Group gap="xs">
                                {queue.categoryBreakdown
                                  .slice(0, 5)
                                  .map((cat) => (
                                    <Badge key={cat.categoryId} variant="light">
                                      {cat.categoryName}: {cat.count}
                                    </Badge>
                                  ))}
                                {queue.categoryBreakdown.length > 5 && (
                                  <Badge variant="light" color="gray">
                                    +{queue.categoryBreakdown.length - 5}{" "}
                                    {t("more")}
                                  </Badge>
                                )}
                              </Group>
                            </Box>
                          )}
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Center h="100%">
                          <RingProgress
                            size={120}
                            thickness={12}
                            sections={[
                              {
                                value:
                                  (queue.openTickets / queue.totalTickets) *
                                  100,
                                color: colors.getStatusColor("opened"),
                              },
                              {
                                value:
                                  (queue.inProgressTickets /
                                    queue.totalTickets) *
                                  100,
                                color: colors.getStatusColor("inProgress"),
                              },
                              {
                                value:
                                  (queue.resolvedTickets / queue.totalTickets) *
                                  100,
                                color: colors.getStatusColor("resolved"),
                              },
                              {
                                value:
                                  (queue.closedTickets / queue.totalTickets) *
                                  100,
                                color: colors.getStatusColor("closed"),
                              },
                            ]}
                            label={
                              <Center>
                                <Text size="xl" fw={700}>
                                  {queue.totalTickets}
                                </Text>
                              </Center>
                            }
                          />
                        </Center>
                      </Grid.Col>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card withBorder p="md">
                <Stack gap="md" align="center" py="xl">
                  <Text size="lg" fw={600}>
                    {t("sections.queuePerformance")}
                  </Text>
                  <Text c="dimmed" ta="center">
                    {t("empty.noData")}
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Queue performance analytics will be available once tickets
                    are created in queues.
                  </Text>
                </Stack>
              </Card>
            )}
          </Tabs.Panel>

          {/* Flow Tab */}
          <Tabs.Panel value="flow" pt="lg">
            {statusFlowQuery.data ? (
              <Stack gap="lg">
                {/* Average Time in Status */}
                <Card withBorder p="md">
                  <Text size="lg" fw={600} mb="md">
                    {t("sections.averageTimeInStatus")}
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    {Object.entries(
                      statusFlowQuery.data.averageTimeInStatus
                    ).map(([status, hours]) => (
                      <Card key={status} withBorder p="md">
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" c="dimmed" mb={4}>
                              {status === "inProgress"
                                ? t("status.inProgress")
                                : t(`status.${status}`)}
                            </Text>
                            <Text size="xl" fw={700}>
                              {formatDuration(hours)}
                            </Text>
                          </div>
                          <ThemeIcon
                            color={colors.getStatusMantineColor(
                              status === "inProgress"
                                ? "inProgress"
                                : (status as "opened" | "resolved" | "closed")
                            )}
                            variant="light"
                            radius="xl"
                            size="xl"
                          >
                            <IconClock size={28} />
                          </ThemeIcon>
                        </Group>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Card>

                {/* Status Transitions */}
                <Card withBorder p="md">
                  <Text size="lg" fw={600} mb="md">
                    {t("sections.statusTransitions")}
                  </Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t("table.from")}</Table.Th>
                        <Table.Th>{t("table.to")}</Table.Th>
                        <Table.Th ta="center">{t("table.count")}</Table.Th>
                        <Table.Th ta="center">{t("table.avgTime")}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {statusFlowQuery.data.statusTransitions.map(
                        (transition, index) => (
                          <Table.Tr key={index}>
                            <Table.Td>
                              <Badge
                                color={colors.getStatusMantineColor(
                                  transition.from
                                    .replace("status.", "")
                                    .replace("Opened", "opened")
                                    .replace("In Progress", "inProgress")
                                    .replace("Resolved", "resolved")
                                    .replace("Closed", "closed") as
                                    | "opened"
                                    | "inProgress"
                                    | "resolved"
                                    | "closed"
                                )}
                                variant="light"
                              >
                                {t(
                                  `status.${transition.from
                                    .replace("status.", "")
                                    .replace("In Progress", "inProgress")
                                    .toLowerCase()}`
                                )}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={colors.getStatusMantineColor(
                                  transition.to
                                    .replace("status.", "")
                                    .replace("Opened", "opened")
                                    .replace("In Progress", "inProgress")
                                    .replace("Resolved", "resolved")
                                    .replace("Closed", "closed") as
                                    | "opened"
                                    | "inProgress"
                                    | "resolved"
                                    | "closed"
                                )}
                                variant="light"
                              >
                                {t(
                                  `status.${transition.to
                                    .replace("status.", "")
                                    .replace("In Progress", "inProgress")
                                    .toLowerCase()}`
                                )}
                              </Badge>
                            </Table.Td>
                            <Table.Td ta="center">{transition.count}</Table.Td>
                            <Table.Td ta="center">
                              {formatDuration(transition.averageTimeHours)}
                            </Table.Td>
                          </Table.Tr>
                        )
                      )}
                    </Table.Tbody>
                  </Table>
                </Card>
              </Stack>
            ) : (
              <Card withBorder p="md">
                <Stack gap="md" align="center" py="xl">
                  <Text size="lg" fw={600}>
                    {t("sections.statusFlow")}
                  </Text>
                  <Text c="dimmed" ta="center">
                    {t("empty.noData")}
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Status flow analytics will be available once tickets have
                    status transitions.
                  </Text>
                </Stack>
              </Card>
            )}
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Container>
  );
}

export default ReportsPageContent;
