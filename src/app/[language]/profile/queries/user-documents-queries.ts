// src/app/[language]/profile/queries/user-documents-queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import {
  CreateUserDocumentRequest,
  DeleteUserDocumentRequest,
  useCreateUserDocumentService,
  useDeleteUserDocumentService,
  useGetUserDocumentsService,
} from "@/services/api/services/user-documents";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export const userDocumentsQueryKeys = createQueryKeys(["userDocuments"], {
  list: () => ({
    key: [],
  }),
});

export const useUserDocumentsQuery = () => {
  const getUserDocumentsService = useGetUserDocumentsService();

  return useQuery({
    queryKey: userDocumentsQueryKeys.list().key,
    queryFn: async ({ signal }) => {
      const { status, data } = await getUserDocumentsService(
        undefined,
        undefined,
        {
          signal,
        }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }

      return [];
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useCreateUserDocumentMutation = () => {
  const createUserDocumentService = useCreateUserDocumentService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("profile");

  return useMutation({
    mutationFn: async (documentData: CreateUserDocumentRequest) => {
      const { status, data } = await createUserDocumentService(documentData);

      if (status !== HTTP_CODES_ENUM.CREATED) {
        throw new Error("Failed to upload document");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userDocumentsQueryKeys.list().key,
      });
      enqueueSnackbar(t("profile:documents.alerts.upload.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("profile:documents.alerts.upload.error"), {
        variant: "error",
      });
    },
  });
};

export const useDeleteUserDocumentMutation = () => {
  const deleteUserDocumentService = useDeleteUserDocumentService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("profile");

  return useMutation({
    mutationFn: async ({ id }: DeleteUserDocumentRequest) => {
      const { status } = await deleteUserDocumentService({ id });

      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete document");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userDocumentsQueryKeys.list().key,
      });
      enqueueSnackbar(t("profile:documents.alerts.delete.success"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("profile:documents.alerts.delete.error"), {
        variant: "error",
      });
    },
  });
};
