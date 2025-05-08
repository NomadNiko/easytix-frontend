// src/services/api/services/queues.ts
import {
  createGetService,
  createPostService,
  createPatchService,
  createDeleteService,
} from "../factory";
import { InfinityPaginationType } from "../types/infinity-pagination";

// Type definitions
export type Queue = {
  id: string;
  name: string;
  description: string;
  assignedUserIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type QueuesRequest = {
  page: number;
  limit: number;
  search?: string;
};

export type QueuesResponse = InfinityPaginationType<Queue>;

export type QueueResponse = Queue;

export type QueueCreateRequest = {
  name: string;
  description: string;
  assignedUserIds?: string[];
};

export type QueueUpdateRequest = {
  name?: string;
  description?: string;
};

export type QueueAssignUserRequest = {
  userId: string;
};

// Format query params for queues list endpoint
const formatQueuesQueryParams = (params: QueuesRequest) => {
  const searchParams = new URLSearchParams();
  searchParams.append("page", params.page.toString());
  searchParams.append("limit", params.limit.toString());
  if (params.search) {
    searchParams.append("search", params.search);
  }
  return searchParams.toString();
};

// API Services
export const useGetQueuesService = createGetService<
  QueuesResponse,
  void,
  QueuesRequest
>("/v1/queues", {
  formatQueryParams: formatQueuesQueryParams,
});

export const useGetQueueService = createGetService<
  QueueResponse,
  { id: string }
>((params: { id: string }) => `/v1/queues/${params.id}`);

export const useCreateQueueService = createPostService<
  QueueCreateRequest,
  QueueResponse
>("/v1/queues");

export const useUpdateQueueService = createPatchService<
  QueueUpdateRequest,
  QueueResponse,
  { id: string }
>((params) => `/v1/queues/${params.id}`);

export const useAssignUserToQueueService = createPostService<
  QueueAssignUserRequest,
  QueueResponse,
  { id: string }
>((params) => `/v1/queues/${params.id}/users`);

export const useRemoveUserFromQueueService = createDeleteService<
  void,
  { id: string; userId: string }
>((params) => `/v1/queues/${params.id}/users/${params.userId}`);

export const useDeleteQueueService = createDeleteService<void, { id: string }>(
  (params) => `/v1/queues/${params.id}`
);
