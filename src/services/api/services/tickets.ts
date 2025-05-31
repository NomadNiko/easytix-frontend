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
};

export type TicketsQueryParams = {
  page?: number;
  limit?: number;
  queueId?: string;
  categoryId?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string;
  createdById?: string;
  search?: string;
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
};

// Format query params for tickets list endpoint
const formatTicketsQueryParams = (params: TicketsQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.queueId) searchParams.append("queueId", params.queueId);
  if (params.categoryId) searchParams.append("categoryId", params.categoryId);
  if (params.status) searchParams.append("status", params.status);
  if (params.priority) searchParams.append("priority", params.priority);
  if (params.assignedToId)
    searchParams.append("assignedToId", params.assignedToId);
  if (params.createdById)
    searchParams.append("createdById", params.createdById);
  if (params.search) searchParams.append("search", params.search);
  return searchParams.toString();
};

// API Services
export const useGetTicketsService = createGetService<
  Ticket[],
  void,
  TicketsQueryParams
>("/v1/tickets", {
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
