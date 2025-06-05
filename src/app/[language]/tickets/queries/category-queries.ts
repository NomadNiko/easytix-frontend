// src/app/[language]/tickets/queries/category-queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

import {
  useGetCategoriesService,
  useGetCategoriesByQueueService,
  useGetCategoryService,
  useCreateCategoryService,
  useUpdateCategoryService,
  useDeleteCategoryService,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from "@/services/api/services/categories";

export const categoryQueryKeys = createQueryKeys(["categories"], {
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
      byQueue: ({ queueId }: { queueId: string }) => ({
        key: [queueId],
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

export const useCategoriesQuery = (
  page = 1,
  limit = 100,
  search?: string,
  enabled = true
) => {
  const getCategoriesService = useGetCategoriesService();
  return useQuery({
    queryKey: categoryQueryKeys.list().sub.by({ page, limit, search }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getCategoriesService(
        undefined,
        { page, limit, search },
        { signal }
      );
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      return [];
    },
    enabled,
  });
};

export const useCategoriesByQueueQuery = (queueId: string, enabled = true) => {
  const getCategoriesService = useGetCategoriesByQueueService();
  return useQuery({
    queryKey: categoryQueryKeys.list().sub.byQueue({ queueId }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getCategoriesService(
        { queueId },
        undefined,
        { signal }
      );
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      return [];
    },
    enabled: !!queueId && enabled,
  });
};

export const useCategoryQuery = (id: string, enabled = true) => {
  const getCategoryService = useGetCategoryService();
  return useQuery({
    queryKey: categoryQueryKeys.detail().sub.by({ id }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getCategoryService({ id }, undefined, {
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

export const useCreateCategoryMutation = () => {
  const createCategoryService = useCreateCategoryService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async (data: CategoryCreateRequest) => {
      const { status, data: responseData } = await createCategoryService(data);
      if (status !== HTTP_CODES_ENUM.CREATED) {
        throw new Error("Failed to create category");
      }
      return responseData;
    },
    onSuccess: (_, { queueId }) => {
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.list().sub.byQueue({ queueId }).key,
      });
      enqueueSnackbar(t("tickets:categories.alerts.create.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:categories.alerts.create.error"), {
        variant: "error",
      });
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const updateCategoryService = useUpdateCategoryService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CategoryUpdateRequest;
      queueId: string;
    }) => {
      const { status, data: responseData } = await updateCategoryService(data, {
        id,
      });
      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to update category");
      }
      return responseData;
    },
    onSuccess: (_, { id, queueId }) => {
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.detail().sub.by({ id }).key,
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.list().sub.byQueue({ queueId }).key,
      });
      enqueueSnackbar(t("tickets:categories.alerts.update.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:categories.alerts.update.error"), {
        variant: "error",
      });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const deleteCategoryService = useDeleteCategoryService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({ id }: { id: string; queueId: string }) => {
      const { status } = await deleteCategoryService({ id });
      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete category");
      }
    },
    onSuccess: (_, { queueId }) => {
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.list().sub.byQueue({ queueId }).key,
      });
      enqueueSnackbar(t("tickets:categories.alerts.delete.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:categories.alerts.delete.error"), {
        variant: "error",
      });
    },
  });
};
