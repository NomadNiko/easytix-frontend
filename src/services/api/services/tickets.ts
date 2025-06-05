import {
  createGetService,
  createPostService,
  createPatchService,
  createDeleteService,
} from "../factory";
import { FileEntity } from "../types/file-entity"; // Instead of file.dto

// Type definitions - Export these enums
export enum TicketStatus {
  OPENED = "Opened",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
}

export enum TicketPriority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export type Ticket = {
  id: string;
  queueId: string;
  categoryId: string;
  title: string;
  details: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedToId: string | null;
  createdById: string;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  closingNotes: string | null;
  queue?: { id: string; name: string };
  category?: { id: string; name: string };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type TicketsPaginatedResponse = {
  data: Ticket[];
  hasNextPage: boolean;
  total?: number;
};

export type TicketsQueryParams = {
  page?: number;
  limit?: number;
  // Legacy single parameters
  queueId?: string;
  categoryId?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string;
  createdById?: string;
  // Array-based parameters
  queueIds?: string[];
  categoryIds?: string[];
  statuses?: TicketStatus[];
  priorities?: TicketPriority[];
  assignedToUserIds?: string[];
  createdByUserIds?: string[];
  // Other parameters
  search?: string;
  userIds?: string[];
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  closedAfter?: string;
  closedBefore?: string;
  unassigned?: boolean;
  hasDocuments?: boolean;
  hasComments?: boolean;
  includeArchived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type TicketCreateRequest = {
  queueId: string;
  categoryId: string;
  title: string;
  details: string;
  priority: TicketPriority;
  documentIds?: string[];
};

export type TicketUpdateRequest = {
  queueId?: string;
  categoryId?: string;
  title?: string;
  details?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string | null;
  closingNotes?: string | null;
  closedAt?: Date | null;
};

export type TicketAssignRequest = {
  userId: string;
};

export type TicketStatusUpdateRequest = {
  status: TicketStatus;
  closingNotes?: string;
};

// Format query params for tickets list endpoint
const formatTicketsQueryParams = (params: TicketsQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  // Legacy single value parameters
  if (params.queueId) searchParams.append("queueId", params.queueId);
  if (params.categoryId) searchParams.append("categoryId", params.categoryId);
  if (params.status) searchParams.append("status", params.status);
  if (params.priority) searchParams.append("priority", params.priority);
  if (params.assignedToId)
    searchParams.append("assignedToId", params.assignedToId);
  if (params.createdById)
    searchParams.append("createdById", params.createdById);

  // Array-based parameters
  if (params.queueIds && params.queueIds.length > 0)
    searchParams.append("queueIds", params.queueIds.join(","));
  if (params.categoryIds && params.categoryIds.length > 0)
    searchParams.append("categoryIds", params.categoryIds.join(","));
  if (params.statuses && params.statuses.length > 0)
    searchParams.append("statuses", params.statuses.join(","));
  if (params.priorities && params.priorities.length > 0)
    searchParams.append("priorities", params.priorities.join(","));
  if (params.assignedToUserIds && params.assignedToUserIds.length > 0)
    searchParams.append(
      "assignedToUserIds",
      params.assignedToUserIds.join(",")
    );
  if (params.createdByUserIds && params.createdByUserIds.length > 0)
    searchParams.append("createdByUserIds", params.createdByUserIds.join(","));

  // Other parameters
  if (params.search) searchParams.append("search", params.search);
  if (params.userIds && params.userIds.length > 0)
    searchParams.append("userIds", params.userIds.join(","));
  if (params.createdAfter)
    searchParams.append("createdAfter", params.createdAfter);
  if (params.createdBefore)
    searchParams.append("createdBefore", params.createdBefore);
  if (params.updatedAfter)
    searchParams.append("updatedAfter", params.updatedAfter);
  if (params.updatedBefore)
    searchParams.append("updatedBefore", params.updatedBefore);
  if (params.closedAfter)
    searchParams.append("closedAfter", params.closedAfter);
  if (params.closedBefore)
    searchParams.append("closedBefore", params.closedBefore);
  if (params.unassigned)
    searchParams.append("unassigned", params.unassigned.toString());
  if (params.hasDocuments)
    searchParams.append("hasDocuments", params.hasDocuments.toString());
  if (params.hasComments)
    searchParams.append("hasComments", params.hasComments.toString());
  if (params.includeArchived)
    searchParams.append("includeArchived", params.includeArchived.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);
  return searchParams.toString();
};

// API Services
export const useGetTicketsService = createGetService<
  TicketsPaginatedResponse,
  void,
  TicketsQueryParams
>("/v1/tickets", {
  formatQueryParams: formatTicketsQueryParams,
});

export const useGetAllTicketsService = createGetService<
  Ticket[],
  void,
  TicketsQueryParams
>("/v1/tickets/all", {
  formatQueryParams: formatTicketsQueryParams,
});

export const useGetTicketService = createGetService<Ticket, { id: string }>(
  (params) => `/v1/tickets/${params.id}`
);

export const useCreateTicketService = createPostService<
  TicketCreateRequest,
  Ticket
>("/v1/tickets");

export const useUpdateTicketService = createPatchService<
  TicketUpdateRequest,
  Ticket,
  { id: string }
>((params) => `/v1/tickets/${params.id}`);

export const useAssignTicketService = createPatchService<
  TicketAssignRequest,
  Ticket,
  { id: string }
>((params) => `/v1/tickets/${params.id}/assign`);

export const useUpdateTicketStatusService = createPatchService<
  TicketStatusUpdateRequest,
  Ticket,
  { id: string }
>((params) => `/v1/tickets/${params.id}/status`);

export const useAddDocumentToTicketService = createPostService<
  FileEntity,
  Ticket,
  { id: string }
>((params) => `/v1/tickets/${params.id}/documents`);

export const useRemoveDocumentFromTicketService = createDeleteService<
  Ticket,
  { id: string; documentId: string }
>((params) => `/v1/tickets/${params.id}/documents/${params.documentId}`);

export const useDeleteTicketService = createDeleteService<void, { id: string }>(
  (params) => `/v1/tickets/${params.id}`
);

// Public ticket creation (no auth required)
export type PublicTicketCreateRequest = {
  // Ticket fields
  queueId: string;
  categoryId: string;
  title: string;
  details: string;
  priority: TicketPriority;
  documentIds?: string[];
  // User fields
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export const useCreatePublicTicketService = createPostService<
  PublicTicketCreateRequest,
  Ticket
>("/v1/tickets/public", {
  requiresAuth: false,
});

// Batch operations for performance optimization
export type BatchUpdateTicketRequest = {
  id: string;
  status?: TicketStatus;
  assignedToId?: string | null;
  closingNotes?: string;
};

export type BatchUpdateTicketsRequest = {
  updates: BatchUpdateTicketRequest[];
};

export type BatchAssignTicketsRequest = {
  ticketIds: string[];
  userId: string;
};

export const useBatchUpdateTicketsService = createPatchService<
  BatchUpdateTicketsRequest,
  Ticket[]
>("/v1/tickets/batch");

export const useBatchAssignTicketsService = createPatchService<
  BatchAssignTicketsRequest,
  Ticket[]
>("/v1/tickets/batch/assign");

// Analytics Types
export type ResolutionTimeAnalytics = {
  overall: {
    averageResolutionTimeHours: number;
    medianResolutionTimeHours: number;
    totalTicketsResolved: number;
  };
  byPriority: {
    high?: {
      averageResolutionTimeHours: number;
      medianResolutionTimeHours?: number;
      ticketCount: number;
    };
    medium?: {
      averageResolutionTimeHours: number;
      medianResolutionTimeHours?: number;
      ticketCount: number;
    };
    low?: {
      averageResolutionTimeHours: number;
      medianResolutionTimeHours?: number;
      ticketCount: number;
    };
  };
  byQueue: Array<{
    queueId: string;
    queueName: string;
    averageResolutionTimeHours: number;
    ticketCount: number;
  }>;
  byUser: Array<{
    userId: string;
    userName: string;
    averageResolutionTimeHours: number;
    ticketCount: number;
  }>;
};

export type VolumeTrends = {
  daily: Array<{
    date: string;
    created: number;
    resolved: number;
    closed: number;
  }>;
  weekly: Array<{
    weekStart: string;
    created: number;
    resolved: number;
    closed: number;
  }>;
  monthly: Array<{
    month: string;
    created: number;
    resolved: number;
    closed: number;
  }>;
};

export type UserPerformance = Array<{
  userId: string;
  userName: string;
  userEmail: string;
  totalAssigned: number;
  totalResolved: number;
  totalInProgress: number;
  averageResolutionTimeHours: number;
  ticketsResolvedLast7Days: number;
  ticketsResolvedLast30Days: number;
  resolutionRate: number;
}>;

export type QueuePerformance = Array<{
  queueId: string;
  queueName: string;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTimeHours: number;
  ticketsCreatedLast7Days: number;
  ticketsCreatedLast30Days: number;
  resolutionRate: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
}>;

export type StatusFlowAnalytics = {
  averageTimeInStatus: {
    opened: number;
    inProgress: number;
    resolved: number;
  };
  statusTransitions: Array<{
    from: string;
    to: string;
    count: number;
    averageTimeHours: number;
  }>;
};

export type PeakHoursAnalytics = {
  hourlyData: Array<{
    hour: number;
    ticketCount: number;
  }>;
  dailyData: Array<{
    dayOfWeek: number;
    dayName: string;
    ticketCount: number;
  }>;
  peakHour: number;
  peakDay: string;
};

export type TicketStatistics = {
  total: number;
  open: number;
  closed: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byQueue: Array<{
    queueId: string;
    queueName: string;
    count: number;
  }>;
};

export type AnalyticsQueryParams = {
  createdAfter?: string;
  createdBefore?: string;
  closedAfter?: string;
  closedBefore?: string;
  queueIds?: string[];
  categoryIds?: string[];
  priorities?: TicketPriority[];
  assignedToUserIds?: string[];
  period?: string;
};

// Format query params for analytics endpoints
const formatAnalyticsQueryParams = (params: AnalyticsQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params.createdAfter)
    searchParams.append("createdAfter", params.createdAfter);
  if (params.createdBefore)
    searchParams.append("createdBefore", params.createdBefore);
  if (params.closedAfter)
    searchParams.append("closedAfter", params.closedAfter);
  if (params.closedBefore)
    searchParams.append("closedBefore", params.closedBefore);

  if (params.queueIds && params.queueIds.length > 0)
    searchParams.append("queueIds", params.queueIds.join(","));
  if (params.categoryIds && params.categoryIds.length > 0)
    searchParams.append("categoryIds", params.categoryIds.join(","));
  if (params.priorities && params.priorities.length > 0)
    searchParams.append("priorities", params.priorities.join(","));
  if (params.assignedToUserIds && params.assignedToUserIds.length > 0)
    searchParams.append(
      "assignedToUserIds",
      params.assignedToUserIds.join(",")
    );
  if (params.period) searchParams.append("period", params.period);

  return searchParams.toString();
};

// Analytics Services
export const useGetResolutionTimeAnalyticsService = createGetService<
  ResolutionTimeAnalytics,
  void,
  AnalyticsQueryParams
>("/v1/tickets/analytics/resolution-time", {
  formatQueryParams: formatAnalyticsQueryParams,
});

export const useGetVolumeTrendsService = createGetService<
  VolumeTrends,
  void,
  AnalyticsQueryParams
>("/v1/tickets/analytics/volume-trends", {
  formatQueryParams: formatAnalyticsQueryParams,
});

export const useGetUserPerformanceService = createGetService<
  UserPerformance,
  void,
  AnalyticsQueryParams
>("/v1/tickets/analytics/user-performance", {
  formatQueryParams: formatAnalyticsQueryParams,
});

export const useGetQueuePerformanceService = createGetService<
  QueuePerformance,
  void,
  AnalyticsQueryParams
>("/v1/tickets/analytics/queue-performance", {
  formatQueryParams: formatAnalyticsQueryParams,
});

export const useGetStatusFlowAnalyticsService = createGetService<
  StatusFlowAnalytics,
  void,
  AnalyticsQueryParams
>("/v1/tickets/analytics/status-flow", {
  formatQueryParams: formatAnalyticsQueryParams,
});

export const useGetPeakHoursAnalyticsService = createGetService<
  PeakHoursAnalytics,
  void,
  AnalyticsQueryParams
>("/v1/tickets/analytics/peak-hours", {
  formatQueryParams: formatAnalyticsQueryParams,
});

export const useGetTicketStatisticsService = createGetService<
  TicketStatistics,
  void,
  AnalyticsQueryParams
>("/v1/tickets/statistics", {
  formatQueryParams: formatAnalyticsQueryParams,
});
