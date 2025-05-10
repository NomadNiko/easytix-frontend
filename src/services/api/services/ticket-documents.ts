// src/services/api/services/ticket-documents.ts
import { FileEntity } from "../types/file-entity";
import {
  createGetService,
  createPostService,
  createDeleteService,
} from "../factory";
import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";

// Type definitions
export type TicketDocument = {
  id: string;
  ticketId: string;
  file: FileEntity;
  name: string;
  uploadedAt: string;
  updatedAt: string;
};

export type TicketDocumentsResponse = TicketDocument[];

export type DeleteTicketDocumentRequest = {
  ticketId: string;
  documentId: string;
};

// API Services
export const useGetTicketDocumentsService = createGetService<
  TicketDocumentsResponse,
  { ticketId: string }
>((params) => `/v1/ticket-documents/${params.ticketId}`);

export const useUploadTicketDocumentService = createPostService<
  {
    ticketId: string;
    file: FileEntity;
    name: string;
  },
  TicketDocument
>("/v1/ticket-documents");

export const useDeleteTicketDocumentService = createDeleteService<
  void,
  DeleteTicketDocumentRequest
>((params) => `/v1/ticket-documents/${params.ticketId}/${params.documentId}`);

// Direct File Upload Service for ticket documents
export function useTicketFileUploadService() {
  const fetchClient = useFetch();

  return useCallback(
    async (file: File, ticketId: string) => {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ticketId", ticketId);

      return fetchClient(`${API_URL}/v1/ticket-documents/upload-file`, {
        method: "POST",
        body: formData,
      }).then(wrapperFetchJsonResponse<{ file: FileEntity }>);
    },
    [fetchClient]
  );
}

// Download URL Generator for direct S3 access
export function getTicketDocumentDownloadUrl(
  ticketId: string,
  documentId: string,
  filePath: string
): string {
  const s3Region = process.env.NEXT_PUBLIC_AWS_S3_REGION || "us-east-2";
  const s3Bucket =
    process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "ixplor-bucket-test-01";

  // If filePath already starts with http or https, it's already a full URL
  if (filePath.startsWith("http")) {
    return filePath;
  }

  // For backend-stored S3 keys (like 'files/tickets/{ticketId}/{filename}')
  // Extract just the filename if the path contains directory structure
  let filename = filePath;
  if (filePath.includes("/")) {
    filename = filePath.split("/").pop() || filePath;
  }

  // Return the properly constructed S3 URL
  return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/files/tickets/${ticketId}/${filename}`;
}
