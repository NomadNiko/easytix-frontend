// src/app/[language]/tickets/queries/ticket-queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

import {
  useGetTicketsService,
  useGetAllTicketsService,
  useGetTicketStatisticsService,
  useGetTicketService,
  useCreateTicketService,
  useUpdateTicketService,
  useAssignTicketService,
  useAddDocumentToTicketService,
  useRemoveDocumentFromTicketService,
  useDeleteTicketService,
  TicketCreateRequest,
  TicketUpdateRequest,
  TicketStatus,
  TicketsQueryParams,
  TicketsPaginatedResponse,
} from "@/services/api/services/tickets";

export const ticketQueryKeys = createQueryKeys(["tickets"], {
  list: () => ({
    key: [],
    sub: {
      by: (filters?: TicketsQueryParams) => ({
        key: [filters],
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

export { TicketStatus, TicketPriority } from "@/services/api/services/tickets";

export const useTicketsQuery = (
  filters?: TicketsQueryParams,
  enabled = true
) => {
  const getTicketsService = useGetTicketsService();

  return useQuery<TicketsPaginatedResponse>({
    queryKey: ["tickets", "list", filters],
    queryFn: async ({ signal }) => {
      const { status, data } = await getTicketsService(undefined, filters, {
        signal,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      return { data: [], hasNextPage: false };
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds - reasonable freshness
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Reduce retries to avoid request spam
    retryDelay: 1000, // 1 second delay between retries
  });
};

export const useAllTicketsQuery = (
  filters?: TicketsQueryParams,
  enabled = true
) => {
  const getAllTicketsService = useGetAllTicketsService();

  return useQuery({
    queryKey: ["tickets", "all", filters],
    queryFn: async ({ signal }) => {
      const { status, data } = await getAllTicketsService(undefined, filters, {
        signal,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      return [];
    },
    enabled,
  });
};

export const useTicketStatisticsQuery = (
  filters?: TicketsQueryParams,
  enabled = true
) => {
  const getTicketStatisticsService = useGetTicketStatisticsService();

  return useQuery({
    queryKey: ["tickets", "statistics", filters],
    queryFn: async ({ signal }) => {
      const { status, data } = await getTicketStatisticsService(
        undefined,
        filters,
        {
          signal,
        }
      );
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      return null;
    },
    enabled,
  });
};

export const useTicketQuery = (id: string, enabled = true) => {
  const getTicketService = useGetTicketService();

  return useQuery({
    queryKey: ticketQueryKeys.detail().sub.by({ id }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getTicketService({ id }, undefined, {
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

export const useCreateTicketMutation = () => {
  const createTicketService = useCreateTicketService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async (data: TicketCreateRequest) => {
      const { status, data: responseData } = await createTicketService(data);
      if (status !== HTTP_CODES_ENUM.CREATED) {
        throw new Error("Failed to create ticket");
      }
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.list().key,
      });
      enqueueSnackbar(t("tickets:tickets.alerts.create.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:tickets.alerts.create.error"), {
        variant: "error",
      });
    },
  });
};

export const useUpdateTicketMutation = () => {
  const updateTicketService = useUpdateTicketService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: TicketUpdateRequest;
    }) => {
      const { status, data: responseData } = await updateTicketService(data, {
        id,
      });
      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to update ticket");
      }
      return responseData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail().sub.by({ id }).key,
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.list().key,
      });
      enqueueSnackbar(t("tickets:tickets.alerts.update.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:tickets.alerts.update.error"), {
        variant: "error",
      });
    },
  });
};

export const useAssignTicketMutation = () => {
  const assignTicketService = useAssignTicketService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { status, data: responseData } = await assignTicketService(
        { userId },
        { id }
      );
      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to assign ticket");
      }
      return responseData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail().sub.by({ id }).key,
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.list().key,
      });
      enqueueSnackbar(t("tickets:tickets.alerts.assign.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:tickets.alerts.assign.error"), {
        variant: "error",
      });
    },
  });
};

export const useUpdateTicketStatusMutation = () => {
  const updateTicketService = useUpdateTicketService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({
      id,
      status,
      closingNotes,
    }: {
      id: string;
      status: TicketStatus;
      closingNotes?: string;
    }) => {
      const { status: responseStatus, data: responseData } =
        await updateTicketService({ status, closingNotes }, { id });
      if (responseStatus !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to update ticket status");
      }
      return responseData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail().sub.by({ id }).key,
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.list().key,
      });
      enqueueSnackbar(t("tickets:tickets.alerts.updateStatus.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:tickets.alerts.updateStatus.error"), {
        variant: "error",
      });
    },
  });
};

export const useAddDocumentToTicketMutation = () => {
  const addDocumentService = useAddDocumentToTicketService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({ id, fileId }: { id: string; fileId: string }) => {
      const { status, data: responseData } = await addDocumentService(
        { id: fileId, path: "" },
        { id }
      );
      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to add document to ticket");
      }
      return responseData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail().sub.by({ id }).key,
      });
      enqueueSnackbar(t("tickets:tickets.alerts.addDocument.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:tickets.alerts.addDocument.error"), {
        variant: "error",
      });
    },
  });
};

export const useRemoveDocumentFromTicketMutation = () => {
  const removeDocumentService = useRemoveDocumentFromTicketService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({
      id,
      documentId,
    }: {
      id: string;
      documentId: string;
    }) => {
      const { status, data: responseData } = await removeDocumentService({
        id,
        documentId,
      });
      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to remove document from ticket");
      }
      return responseData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail().sub.by({ id }).key,
      });
      enqueueSnackbar(t("tickets:tickets.alerts.removeDocument.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:tickets.alerts.removeDocument.error"), {
        variant: "error",
      });
    },
  });
};

export const useDeleteTicketMutation = () => {
  const deleteTicketService = useDeleteTicketService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async (id: string) => {
      const { status } = await deleteTicketService({ id });
      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete ticket");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.list().key,
      });
      enqueueSnackbar(t("tickets:tickets.alerts.delete.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:tickets.alerts.delete.error"), {
        variant: "error",
      });
    },
  });
};
