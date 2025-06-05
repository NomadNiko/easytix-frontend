// src/app/[language]/tickets/queries/queue-queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  useGetQueuesService,
  useGetQueueService,
  useCreateQueueService,
  useUpdateQueueService,
  useAssignUserToQueueService,
  useRemoveUserFromQueueService,
  useDeleteQueueService,
  QueueCreateRequest,
  QueueUpdateRequest,
} from "@/services/api/services/queues";

export const queueQueryKeys = createQueryKeys(["queues"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        page,
        limit,
        search,
      }: {
        page?: number;
        limit?: number;
        search?: string;
      }) => ({
        key: [page, limit, search],
      }),
    },
  }),
  detail: () => ({
    key: ["detail"],
    sub: {
      by: ({ id }: { id: string }) => ({
        key: [id],
      }),
    },
  }),
});

export const useQueuesQuery = (
  page = 1,
  limit = 10,
  search?: string,
  enabled = true
) => {
  const getQueuesService = useGetQueuesService();
  return useQuery({
    queryKey: queueQueryKeys.list().sub.by({ page, limit, search }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getQueuesService(
        undefined,
        { page, limit, search },
        { signal }
      );
      if (status === HTTP_CODES_ENUM.OK) {
        // Handle both formats: direct array or {data: [], hasNextPage: boolean}
        // This supports both API response formats
        if (Array.isArray(data)) {
          return { data, hasNextPage: false };
        }
        return data;
      }
      return { data: [], hasNextPage: false };
    },
    enabled,
  });
};

export const useQueueQuery = (id: string, enabled = true) => {
  const getQueueService = useGetQueueService();
  return useQuery({
    queryKey: queueQueryKeys.detail().sub.by({ id }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getQueueService({ id }, undefined, {
        signal,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      return null;
    },
    enabled: !!id && enabled,
  });
};

export { useGetQueueService };

export const useCreateQueueMutation = () => {
  const createQueueService = useCreateQueueService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");
  return useMutation({
    mutationFn: async (data: QueueCreateRequest) => {
      const { status, data: responseData } = await createQueueService(data);
      if (status !== HTTP_CODES_ENUM.CREATED) {
        throw new Error("Failed to create queue");
      }
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queueQueryKeys.list().key,
      });
      enqueueSnackbar(t("tickets:queues.alerts.create.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:queues.alerts.create.error"), {
        variant: "error",
      });
    },
  });
};

export const useUpdateQueueMutation = () => {
  const updateQueueService = useUpdateQueueService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: QueueUpdateRequest;
    }) => {
      const { status, data: responseData } = await updateQueueService(data, {
        id,
      });
      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to update queue");
      }
      return responseData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queueQueryKeys.detail().sub.by({ id }).key,
      });
      queryClient.invalidateQueries({
        queryKey: queueQueryKeys.list().key,
      });
      enqueueSnackbar(t("tickets:queues.alerts.update.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:queues.alerts.update.error"), {
        variant: "error",
      });
    },
  });
};

export const useAssignUserToQueueMutation = () => {
  const assignUserService = useAssignUserToQueueService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      // Using userId as the parameter to match QueueAssignUserRequest
      const { status, data: responseData } = await assignUserService(
        { userId },
        { id }
      );
      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to assign user to queue");
      }
      return responseData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queueQueryKeys.detail().sub.by({ id }).key,
      });
      enqueueSnackbar(t("tickets:queues.alerts.assignUser.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:queues.alerts.assignUser.error"), {
        variant: "error",
      });
    },
  });
};

export const useRemoveUserFromQueueMutation = () => {
  const removeUserService = useRemoveUserFromQueueService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { status } = await removeUserService({ id, userId });
      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to remove user from queue");
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queueQueryKeys.detail().sub.by({ id }).key,
      });
      enqueueSnackbar(t("tickets:queues.alerts.removeUser.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:queues.alerts.removeUser.error"), {
        variant: "error",
      });
    },
  });
};

export const useDeleteQueueMutation = () => {
  const deleteQueueService = useDeleteQueueService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");
  return useMutation({
    mutationFn: async (id: string) => {
      const { status } = await deleteQueueService({ id });
      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete queue");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queueQueryKeys.list().key,
      });
      enqueueSnackbar(t("tickets:queues.alerts.delete.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:queues.alerts.delete.error"), {
        variant: "error",
      });
    },
  });
};
