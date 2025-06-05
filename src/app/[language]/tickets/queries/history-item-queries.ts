// src/app/[language]/tickets/queries/history-item-queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

import {
  useGetHistoryItemsByTicketService,
  useCreateHistoryItemService,
  useCreateCommentService,
  CreateHistoryItemRequest,
} from "@/services/api/services/history-items";

import { ticketQueryKeys } from "./ticket-queries";

export const historyItemQueryKeys = createQueryKeys(["historyItems"], {
  list: () => ({
    key: [],
    sub: {
      byTicket: ({ ticketId }: { ticketId: string }) => ({
        key: [ticketId],
      }),
    },
  }),
});

export const useHistoryItemsByTicketQuery = (
  ticketId: string,
  enabled = true
) => {
  const getHistoryItemsService = useGetHistoryItemsByTicketService();

  return useQuery({
    queryKey: historyItemQueryKeys.list().sub.byTicket({ ticketId }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getHistoryItemsService(
        { ticketId },
        undefined,
        { signal }
      );
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      return [];
    },
    enabled: !!ticketId && enabled,
  });
};

export const useCreateHistoryItemMutation = () => {
  const createHistoryItemService = useCreateHistoryItemService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHistoryItemRequest) => {
      const { status, data: responseData } =
        await createHistoryItemService(data);
      if (status !== HTTP_CODES_ENUM.CREATED) {
        throw new Error("Failed to create history item");
      }
      return responseData;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({
        queryKey: historyItemQueryKeys.list().sub.byTicket({ ticketId }).key,
      });
    },
  });
};

export const useCreateCommentMutation = () => {
  const createCommentService = useCreateCommentService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({
      ticketId,
      details,
    }: {
      ticketId: string;
      details: string;
    }) => {
      const { status, data: responseData } = await createCommentService(
        { details },
        { ticketId }
      );
      if (status !== HTTP_CODES_ENUM.CREATED) {
        throw new Error("Failed to create comment");
      }
      return responseData;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({
        queryKey: historyItemQueryKeys.list().sub.byTicket({ ticketId }).key,
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail().sub.by({ id: ticketId }).key,
      });
      enqueueSnackbar(t("tickets:historyItems.alerts.createComment.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("tickets:historyItems.alerts.createComment.error"), {
        variant: "error",
      });
    },
  });
};
