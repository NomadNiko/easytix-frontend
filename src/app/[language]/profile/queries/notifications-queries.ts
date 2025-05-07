// src/app/[language]/profile/queries/notifications-queries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import useAuth from "@/services/auth/use-auth";
import {
  useGetNotificationsService,
  useGetUnreadCountService,
  useMarkNotificationAsReadService,
  useMarkAllNotificationsAsReadService,
  useDeleteNotificationService,
  NotificationsQueryParams,
  Notification,
} from "@/services/api/services/notifications";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

// Notification polling interval (20 seconds)
const NOTIFICATION_POLL_INTERVAL = 20000;

export const notificationsQueryKeys = createQueryKeys(["notifications"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        filters,
        userId,
      }: {
        filters?: NotificationsQueryParams;
        userId?: string;
      }) => ({
        key: [filters, userId], // Include userId in the query key
      }),
    },
  }),
  unreadCount: () => ({
    key: ["unread-count"],
    sub: {
      by: ({ userId }: { userId?: string }) => ({
        key: [userId], // Include userId in the query key
      }),
    },
  }),
});

// Define the return type structure for notifications query pages
export interface NotificationsPage {
  data: Notification[];
  page: number;
  hasMore: boolean;
}

export const useNotificationsInfiniteQuery = (
  filters?: Omit<NotificationsQueryParams, "page">,
  options?: Partial<
    UseInfiniteQueryOptions<
      NotificationsPage,
      Error,
      InfiniteData<NotificationsPage>
    >
  >
) => {
  const getNotificationsService = useGetNotificationsService();
  const limit = filters?.limit || 10;
  const { user } = useAuth();
  const userId = user?.id;

  return useInfiniteQuery<
    NotificationsPage,
    Error,
    InfiniteData<NotificationsPage>
  >({
    queryKey: notificationsQueryKeys.list().sub.by({ filters, userId }).key,
    queryFn: async ({ pageParam = 1, signal }) => {
      const { status, data } = await getNotificationsService(
        undefined,
        { ...filters, page: pageParam as number, limit },
        { signal }
      );
      if (status === HTTP_CODES_ENUM.OK) {
        return {
          data,
          page: pageParam as number,
          hasMore: data.length === limit, // Determine if there are more items
        };
      }
      return { data: [], page: pageParam as number, hasMore: false };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 1,
    staleTime: 30000, // 30 seconds
    enabled: !!userId, // Only run query if user is logged in
    ...options,
  });
};

export const useUnreadNotificationsCountQuery = (enabled = true) => {
  const getUnreadCountService = useGetUnreadCountService();
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount().sub.by({ userId }).key,
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
    refetchInterval: NOTIFICATION_POLL_INTERVAL, // Poll every 20 seconds
    enabled: enabled && !!userId, // Only run query if user is logged in and the component is enabled
  });
};

export const useMarkNotificationAsReadMutation = () => {
  const markAsReadService = useMarkNotificationAsReadService();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;
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
        queryKey: notificationsQueryKeys.list().sub.by({ userId }).key,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount().sub.by({ userId }).key,
      });
    },
  });
};

export const useMarkAllNotificationsAsReadMutation = () => {
  const markAllAsReadService = useMarkAllNotificationsAsReadService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("notifications");
  const { user } = useAuth();
  const userId = user?.id;
  return useMutation({
    mutationFn: async () => {
      const { status } = await markAllAsReadService();
      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to mark all notifications as read");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.list().sub.by({ userId }).key,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount().sub.by({ userId }).key,
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
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { status } = await deleteNotificationService({ id });
      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete notification");
      }
    },
    onSuccess: (_, { id }) => {
      // Update the query cache directly to remove the deleted notification
      queryClient.setQueriesData(
        { queryKey: notificationsQueryKeys.list().sub.by({ userId }).key },
        (oldData: InfiniteData<NotificationsPage> | undefined) => {
          if (!oldData) return oldData;

          // Create a new pages array with the deleted notification removed
          const newPages = oldData.pages.map((page) => ({
            ...page,
            data: page.data.filter((notification) => notification.id !== id),
          }));

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );

      // Also invalidate the queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.list().sub.by({ userId }).key,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount().sub.by({ userId }).key,
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
