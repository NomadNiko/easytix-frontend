// Unified search criteria interface for all ticket searches
// This will be the single source of truth for all search/filter combinations

import { TicketStatus, TicketPriority } from "../services/tickets";

export interface SearchCriteria {
  // Text search across title, description, comments
  search?: string;

  // Organizational filters (support multiple selections)
  queueIds?: string[];
  categoryIds?: string[];

  // Status and Priority filters (support multiple selections)
  statuses?: TicketStatus[];
  priorities?: TicketPriority[];

  // User-related filters
  assignedToUserIds?: string[]; // Tickets assigned to these users
  createdByUserIds?: string[]; // Tickets created by these users
  unassigned?: boolean; // Show only unassigned tickets

  // Date range filters
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  closedAfter?: Date;
  closedBefore?: Date;

  // Advanced content filters
  hasDocuments?: boolean; // Tickets with attachments
  hasComments?: boolean; // Tickets with comments/history
  includeArchived?: boolean; // Include archived/deleted tickets

  // Result configuration
  sortBy?: "created" | "updated" | "priority" | "status" | "title";
  sortOrder?: "asc" | "desc";

  // Pagination
  page?: number;
  limit?: number;
}

// API-friendly version (dates as ISO strings)
export interface SearchCriteriaAPI {
  search?: string;
  queueIds?: string[];
  categoryIds?: string[];
  statuses?: TicketStatus[];
  priorities?: TicketPriority[];
  assignedToUserIds?: string[];
  createdByUserIds?: string[];
  unassigned?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  closedAfter?: string;
  closedBefore?: string;
  hasDocuments?: boolean;
  hasComments?: boolean;
  includeArchived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Common search presets for quick access
export const SEARCH_PRESETS = {
  ALL_TICKETS: {},
  MY_TICKETS: { currentUserFilter: "created" },
  ASSIGNED_TO_ME: { currentUserFilter: "assigned" },
  UNASSIGNED_HIGH_PRIORITY: {
    unassigned: true,
    priorities: [TicketPriority.HIGH],
  },
  OPEN_TICKETS: {
    statuses: [TicketStatus.OPENED, TicketStatus.IN_PROGRESS],
  },
  RECENTLY_CLOSED: {
    statuses: [TicketStatus.CLOSED],
    closedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  HIGH_PRIORITY_OPEN: {
    priorities: [TicketPriority.HIGH],
    statuses: [TicketStatus.OPENED, TicketStatus.IN_PROGRESS],
  },
} as const;

// Helper function to convert SearchCriteria to API format
export function toAPIFormat(criteria: SearchCriteria): SearchCriteriaAPI {
  return {
    ...criteria,
    createdAfter: criteria.createdAfter?.toISOString(),
    createdBefore: criteria.createdBefore?.toISOString(),
    updatedAfter: criteria.updatedAfter?.toISOString(),
    updatedBefore: criteria.updatedBefore?.toISOString(),
    closedAfter: criteria.closedAfter?.toISOString(),
    closedBefore: criteria.closedBefore?.toISOString(),
  };
}

// Helper function to convert API format back to SearchCriteria
export function fromAPIFormat(apiCriteria: SearchCriteriaAPI): SearchCriteria {
  const { sortBy, ...rest } = apiCriteria;
  return {
    ...rest,
    sortBy: sortBy as SearchCriteria["sortBy"],
    createdAfter: apiCriteria.createdAfter
      ? new Date(apiCriteria.createdAfter)
      : undefined,
    createdBefore: apiCriteria.createdBefore
      ? new Date(apiCriteria.createdBefore)
      : undefined,
    updatedAfter: apiCriteria.updatedAfter
      ? new Date(apiCriteria.updatedAfter)
      : undefined,
    updatedBefore: apiCriteria.updatedBefore
      ? new Date(apiCriteria.updatedBefore)
      : undefined,
    closedAfter: apiCriteria.closedAfter
      ? new Date(apiCriteria.closedAfter)
      : undefined,
    closedBefore: apiCriteria.closedBefore
      ? new Date(apiCriteria.closedBefore)
      : undefined,
  };
}

// Helper function to check if search criteria is empty
export function isEmptySearch(criteria: SearchCriteria): boolean {
  const {
    search,
    queueIds,
    categoryIds,
    statuses,
    priorities,
    assignedToUserIds,
    createdByUserIds,
    unassigned,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    closedAfter,
    closedBefore,
    hasDocuments,
    hasComments,
  } = criteria;

  return (
    !search &&
    (!queueIds || queueIds.length === 0) &&
    (!categoryIds || categoryIds.length === 0) &&
    (!statuses || statuses.length === 0) &&
    (!priorities || priorities.length === 0) &&
    (!assignedToUserIds || assignedToUserIds.length === 0) &&
    (!createdByUserIds || createdByUserIds.length === 0) &&
    !unassigned &&
    !createdAfter &&
    !createdBefore &&
    !updatedAfter &&
    !updatedBefore &&
    !closedAfter &&
    !closedBefore &&
    !hasDocuments &&
    !hasComments
  );
}

// Helper function to generate a human-readable search description
export function getSearchDescription(criteria: SearchCriteria): string {
  const parts: string[] = [];

  if (criteria.search) parts.push(`containing "${criteria.search}"`);
  if (criteria.queueIds?.length)
    parts.push(`in ${criteria.queueIds.length} queue(s)`);
  if (criteria.statuses?.length)
    parts.push(`with status: ${criteria.statuses.join(", ")}`);
  if (criteria.priorities?.length)
    parts.push(`priority: ${criteria.priorities.join(", ")}`);
  if (criteria.unassigned) parts.push("unassigned");
  if (criteria.assignedToUserIds?.length)
    parts.push(`assigned to ${criteria.assignedToUserIds.length} user(s)`);
  if (criteria.createdAfter || criteria.createdBefore) {
    const dateRange = [
      criteria.createdAfter
        ? `after ${criteria.createdAfter.toLocaleDateString()}`
        : "",
      criteria.createdBefore
        ? `before ${criteria.createdBefore.toLocaleDateString()}`
        : "",
    ]
      .filter(Boolean)
      .join(" and ");
    parts.push(`created ${dateRange}`);
  }

  return parts.length > 0 ? parts.join(", ") : "All tickets";
}
