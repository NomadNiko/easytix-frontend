"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  useGetResolutionTimeAnalyticsService,
  useGetVolumeTrendsService,
  useGetUserPerformanceService,
  useGetQueuePerformanceService,
  useGetStatusFlowAnalyticsService,
  useGetPeakHoursAnalyticsService,
  useGetTicketStatisticsService,
  ResolutionTimeAnalytics,
  VolumeTrends,
  UserPerformance,
  QueuePerformance,
  StatusFlowAnalytics,
  PeakHoursAnalytics,
  TicketStatistics,
  AnalyticsQueryParams,
} from "@/services/api/services/tickets";

// Query keys
const analyticsKeys = {
  all: ["analytics"] as const,
  statistics: (filters?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, "statistics", filters] as const,
  resolutionTime: (filters?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, "resolution-time", filters] as const,
  volumeTrends: (filters?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, "volume-trends", filters] as const,
  userPerformance: (filters?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, "user-performance", filters] as const,
  queuePerformance: (filters?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, "queue-performance", filters] as const,
  statusFlow: (filters?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, "status-flow", filters] as const,
  peakHours: (filters?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, "peak-hours", filters] as const,
};

// Statistics Query
export function useTicketStatisticsQuery(
  filters?: AnalyticsQueryParams,
  options?: Omit<UseQueryOptions<TicketStatistics>, "queryKey" | "queryFn">
) {
  const service = useGetTicketStatisticsService();

  return useQuery({
    queryKey: analyticsKeys.statistics(filters),
    queryFn: async () => {
      const response = await service(undefined, filters);
      if (response.status === 200 && "data" in response) {
        return response.data;
      }
      throw new Error("Failed to fetch ticket statistics");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Resolution Time Analytics
export function useResolutionTimeAnalyticsQuery(
  filters?: AnalyticsQueryParams,
  options?: Omit<
    UseQueryOptions<ResolutionTimeAnalytics>,
    "queryKey" | "queryFn"
  >
) {
  const service = useGetResolutionTimeAnalyticsService();

  return useQuery({
    queryKey: analyticsKeys.resolutionTime(filters),
    queryFn: async () => {
      const response = await service(undefined, filters);
      if (response.status === 200 && "data" in response) {
        return response.data;
      }
      throw new Error("Failed to fetch resolution time analytics");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Volume Trends
export function useVolumeTrendsQuery(
  filters?: AnalyticsQueryParams,
  options?: Omit<UseQueryOptions<VolumeTrends>, "queryKey" | "queryFn">
) {
  const service = useGetVolumeTrendsService();

  return useQuery({
    queryKey: analyticsKeys.volumeTrends(filters),
    queryFn: async () => {
      const response = await service(undefined, filters);
      if (response.status === 200 && "data" in response) {
        return response.data;
      }
      throw new Error("Failed to fetch volume trends");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// User Performance
export function useUserPerformanceQuery(
  filters?: AnalyticsQueryParams,
  options?: Omit<UseQueryOptions<UserPerformance>, "queryKey" | "queryFn">
) {
  const service = useGetUserPerformanceService();

  return useQuery({
    queryKey: analyticsKeys.userPerformance(filters),
    queryFn: async () => {
      const response = await service(undefined, filters);
      if (response.status === 200 && "data" in response) {
        return response.data;
      }
      throw new Error("Failed to fetch user performance");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Queue Performance
export function useQueuePerformanceQuery(
  filters?: AnalyticsQueryParams,
  options?: Omit<UseQueryOptions<QueuePerformance>, "queryKey" | "queryFn">
) {
  const service = useGetQueuePerformanceService();

  return useQuery({
    queryKey: analyticsKeys.queuePerformance(filters),
    queryFn: async () => {
      const response = await service(undefined, filters);
      if (response.status === 200 && "data" in response) {
        return response.data;
      }
      throw new Error("Failed to fetch queue performance");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Status Flow Analytics
export function useStatusFlowAnalyticsQuery(
  filters?: AnalyticsQueryParams,
  options?: Omit<UseQueryOptions<StatusFlowAnalytics>, "queryKey" | "queryFn">
) {
  const service = useGetStatusFlowAnalyticsService();

  return useQuery({
    queryKey: analyticsKeys.statusFlow(filters),
    queryFn: async () => {
      const response = await service(undefined, filters);
      if (response.status === 200 && "data" in response) {
        return response.data;
      }
      throw new Error("Failed to fetch status flow analytics");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Peak Hours Analytics
export function usePeakHoursAnalyticsQuery(
  filters?: AnalyticsQueryParams,
  options?: Omit<UseQueryOptions<PeakHoursAnalytics>, "queryKey" | "queryFn">
) {
  const service = useGetPeakHoursAnalyticsService();

  return useQuery({
    queryKey: analyticsKeys.peakHours(filters),
    queryFn: async () => {
      const response = await service(undefined, filters);
      if (response.status === 200 && "data" in response) {
        return response.data;
      }
      throw new Error("Failed to fetch peak hours analytics");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Combined analytics for dashboard overview
export function useAnalyticsOverviewQuery(
  filters?: AnalyticsQueryParams,
  options?: {
    enabled?: boolean;
  }
) {
  const statisticsQuery = useTicketStatisticsQuery(filters, {
    enabled: options?.enabled,
  });
  const resolutionTimeQuery = useResolutionTimeAnalyticsQuery(filters, {
    enabled: options?.enabled,
  });
  const userPerformanceQuery = useUserPerformanceQuery(filters, {
    enabled: options?.enabled,
  });
  const queuePerformanceQuery = useQueuePerformanceQuery(filters, {
    enabled: options?.enabled,
  });

  return {
    statistics: statisticsQuery,
    resolutionTime: resolutionTimeQuery,
    userPerformance: userPerformanceQuery,
    queuePerformance: queuePerformanceQuery,
    isLoading:
      statisticsQuery.isLoading ||
      resolutionTimeQuery.isLoading ||
      userPerformanceQuery.isLoading ||
      queuePerformanceQuery.isLoading,
    error:
      statisticsQuery.error ||
      resolutionTimeQuery.error ||
      userPerformanceQuery.error ||
      queuePerformanceQuery.error,
  };
}
