// src/services/api/services/history-items.ts
import { createGetService, createPostService } from "../factory";

// Type definitions
export enum HistoryItemType {
  COMMENT = "COMMENT",
  CREATED = "CREATED",
  ASSIGNED = "ASSIGNED",
  STATUS_CHANGED = "STATUS_CHANGED",
  CLOSED = "CLOSED",
  REOPENED = "REOPENED",
  DOCUMENT_ADDED = "DOCUMENT_ADDED",
  DOCUMENT_REMOVED = "DOCUMENT_REMOVED",
  PRIORITY_CHANGED = "PRIORITY_CHANGED",
  CATEGORY_CHANGED = "CATEGORY_CHANGED",
}

export type HistoryItem = {
  id: string;
  ticketId: string;
  userId: string;
  type: HistoryItemType;
  details: string;
  createdAt: string;
};

export type CreateHistoryItemRequest = {
  ticketId: string;
  type: HistoryItemType;
  details: string;
};

export type CreateCommentRequest = {
  details: string;
};

// API Services
export const useGetHistoryItemsByTicketService = createGetService<
  HistoryItem[],
  { ticketId: string }
>((params) => `/v1/history-items/ticket/${params.ticketId}`);

export const useCreateHistoryItemService = createPostService<
  CreateHistoryItemRequest,
  HistoryItem
>("/v1/history-items");

export const useCreateCommentService = createPostService<
  CreateCommentRequest,
  HistoryItem,
  { ticketId: string }
>((params) => `/v1/history-items/ticket/${params.ticketId}/comment`);
