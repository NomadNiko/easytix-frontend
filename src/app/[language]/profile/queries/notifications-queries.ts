// src/app/[language]/profile/queries/notifications-queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import {
  useGetNotificationsService,
  useGetUnreadCountService,
  useMarkNotificationAsReadService,
  useMarkAllNotificationsAsReadService,
  useDeleteNotificationService,
  NotificationsQueryParams,
} from "@/services/api/services/notifications";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export const notificationsQueryKeys = createQueryKeys(["notifications"], {
  list: () => ({
    key: [],
    sub: {
      by: ({ filters }: { filters?: NotificationsQueryParams }) => ({
        key: [filters],
      }),
    },
  }),
  unreadCount: () => ({
    key: ["unread-count"],
  }),
});

export const useNotificationsQuery = (filters?: NotificationsQueryParams) => {
  const getNotificationsService = useGetNotificationsService();

  return useQuery({
    queryKey: notificationsQueryKeys.list().sub.by({ filters }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getNotificationsService(
        undefined,
        filters,
        { signal }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }

      return [];
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useUnreadNotificationsCountQuery = () => {
  const getUnreadCountService = useGetUnreadCountService();

  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount().key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getUnreadCountService(
        undefined,
        undefined,
        { signal }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }

      return 0;
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useMarkNotificationAsReadMutation = () => {
  const markAsReadService = useMarkNotificationAsReadService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { status, data } = await markAsReadService(undefined, { id });

      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to mark notification as read");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.list().key,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount().key,
      });
    },
  });
};

export const useMarkAllNotificationsAsReadMutation = () => {
  const markAllAsReadService = useMarkAllNotificationsAsReadService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("notifications");

  return useMutation({
    mutationFn: async () => {
      const { status } = await markAllAsReadService();

      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to mark all notifications as read");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.list().key,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount().key,
      });

      enqueueSnackbar(t("notifications:alerts.markAllAsRead.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("notifications:alerts.markAllAsRead.error"), {
        variant: "error",
      });
    },
  });
};

export const useDeleteNotificationMutation = () => {
  const deleteNotificationService = useDeleteNotificationService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("notifications");

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { status } = await deleteNotificationService({ id });

      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete notification");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.list().key,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount().key,
      });

      enqueueSnackbar(t("notifications:alerts.delete.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("notifications:alerts.delete.error"), {
        variant: "error",
      });
    },
  });
};
