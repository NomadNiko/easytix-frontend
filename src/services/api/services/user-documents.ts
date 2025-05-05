// src/services/api/services/user-documents.ts
import { FileEntity } from "../types/file-entity";
import {
  createGetService,
  createPostService,
  createDeleteService,
} from "../factory";

// Type definitions
export type UserDocument = {
  id: string;
  userId: string;
  file: FileEntity;
  name: string;
  uploadedAt: string;
  updatedAt: string;
};

export type UserDocumentsResponse = UserDocument[];

export type CreateUserDocumentRequest = {
  file: FileEntity;
  name: string;
};

export type CreateUserDocumentResponse = UserDocument;

export type DeleteUserDocumentRequest = {
  id: string;
};

export type DeleteUserDocumentResponse = void;

// API Services using the factory pattern
export const useGetUserDocumentsService =
  createGetService<UserDocumentsResponse>("/v1/user-documents");

export const useCreateUserDocumentService = createPostService<
  CreateUserDocumentRequest,
  CreateUserDocumentResponse
>("/v1/user-documents");

export const useDeleteUserDocumentService = createDeleteService<
  DeleteUserDocumentResponse,
  DeleteUserDocumentRequest
>((params) => `/v1/user-documents/${params.id}`);
