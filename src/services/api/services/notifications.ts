// src/services/api/services/notifications.ts (update to include Notification type export)
import {
  createGetService,
  createPatchService,
  createDeleteService,
} from "../factory";

// Type definitions
export type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  linkLabel?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = Notification[];
export type CountUnreadResponse = number;

export type MarkAsReadResponse = Notification;
export type MarkAsReadRequest = {
  id: string;
};

export type DeleteNotificationRequest = {
  id: string;
};

export type NotificationsQueryParams = {
  page?: number;
  limit?: number;
  isRead?: boolean;
  search?: string;
};

// API Services
export const useGetNotificationsService = createGetService<
  NotificationsResponse,
  void,
  NotificationsQueryParams
>("/v1/notifications", {
  formatQueryParams: (params) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.isRead !== undefined)
      searchParams.append("isRead", params.isRead.toString());
    if (params.search) searchParams.append("search", params.search);
    return searchParams.toString();
  },
});

export const useGetUnreadCountService = createGetService<CountUnreadResponse>(
  "/v1/notifications/count-unread"
);

export const useMarkNotificationAsReadService = createPatchService<
  void,
  MarkAsReadResponse,
  MarkAsReadRequest
>((params) => `/v1/notifications/${params.id}/read`);

export const useMarkAllNotificationsAsReadService = createPatchService<
  void,
  void
>("/v1/notifications/read-all");

export const useDeleteNotificationService = createDeleteService<
  void,
  DeleteNotificationRequest
>((params) => `/v1/notifications/${params.id}`);
