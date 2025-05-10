// src/app/[language]/tickets/queries/ticket-documents-queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import {
  useGetTicketDocumentsService,
  useUploadTicketDocumentService,
  useDeleteTicketDocumentService,
  useTicketFileUploadService,
  DeleteTicketDocumentRequest,
} from "@/services/api/services/ticket-documents";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { ticketQueryKeys } from "./ticket-queries";
import { useCreateHistoryItemMutation } from "./history-item-queries";
import { HistoryItemType } from "@/services/api/services/history-items";

export const ticketDocumentsQueryKeys = createQueryKeys(["ticketDocuments"], {
  list: () => ({
    key: [],
    sub: {
      byTicket: ({ ticketId }: { ticketId: string }) => ({
        key: [ticketId],
      }),
    },
  }),
});

export const useTicketDocumentsQuery = (ticketId: string, enabled = true) => {
  const getTicketDocumentsService = useGetTicketDocumentsService();
  return useQuery({
    queryKey: ticketDocumentsQueryKeys.list().sub.byTicket({ ticketId }).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getTicketDocumentsService(
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

export const useUploadTicketDocumentMutation = () => {
  const uploadTicketDocumentService = useUploadTicketDocumentService();
  const fileUploadService = useTicketFileUploadService();
  const createHistoryItemMutation = useCreateHistoryItemMutation();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({
      ticketId,
      file,
      name,
    }: {
      ticketId: string;
      file: File;
      name: string;
    }) => {
      // First upload the file
      const { status: uploadStatus, data: uploadData } =
        await fileUploadService(file, ticketId);
      if (uploadStatus !== HTTP_CODES_ENUM.CREATED) {
        throw new Error("Failed to upload file");
      }

      // Then create the ticket document record
      const { status, data } = await uploadTicketDocumentService({
        ticketId,
        file: uploadData.file,
        name: name || file.name,
      });
      if (status !== HTTP_CODES_ENUM.CREATED) {
        throw new Error("Failed to create ticket document record");
      }

      // Create a history item with the document name
      await createHistoryItemMutation.mutateAsync({
        ticketId,
        type: HistoryItemType.DOCUMENT_ADDED,
        details: `Document added: ${name || file.name}`,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      const { ticketId } = variables;
      // Invalidate ticket documents query
      queryClient.invalidateQueries({
        queryKey: ticketDocumentsQueryKeys.list().sub.byTicket({ ticketId })
          .key,
      });
      // Invalidate ticket details query to show updated documents list
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail().sub.by({ id: ticketId }).key,
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

export const useDeleteTicketDocumentMutation = () => {
  const deleteTicketDocumentService = useDeleteTicketDocumentService();
  const getTicketDocumentsService = useGetTicketDocumentsService();
  const createHistoryItemMutation = useCreateHistoryItemMutation();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tickets");

  return useMutation({
    mutationFn: async ({
      ticketId,
      documentId,
    }: DeleteTicketDocumentRequest) => {
      // First get the document to get its name
      let documentName = documentId;
      try {
        const { status, data } = await getTicketDocumentsService({ ticketId });
        if (status === HTTP_CODES_ENUM.OK) {
          const document = data.find((doc) => doc.id === documentId);
          if (document) {
            documentName = document.name;
          }
        }
      } catch (error) {
        console.error("Error retrieving document name:", error);
        // Continue with the ID as fallback
      }

      // Delete the document
      const { status } = await deleteTicketDocumentService({
        ticketId,
        documentId,
      });

      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete ticket document");
      }

      // Create a history item with the document name
      await createHistoryItemMutation.mutateAsync({
        ticketId,
        type: HistoryItemType.DOCUMENT_REMOVED,
        details: `Document removed: ${documentName}`,
      });
    },
    onSuccess: (_, { ticketId }) => {
      // Invalidate ticket documents query
      queryClient.invalidateQueries({
        queryKey: ticketDocumentsQueryKeys.list().sub.byTicket({ ticketId })
          .key,
      });
      // Invalidate ticket details query
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail().sub.by({ id: ticketId }).key,
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
