// src/services/api/services/categories.ts
import {
  createGetService,
  createPostService,
  createPatchService,
  createDeleteService,
} from "../factory";

// Type definitions
export type Category = {
  id: string;
  customId: string;
  queueId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryCreateRequest = {
  queueId: string;
  name: string;
};

export type CategoryUpdateRequest = {
  name: string;
};

// API Services
export const useGetCategoriesService = createGetService<
  Category[],
  { page?: number; limit?: number; search?: string }
>("/v1/categories");

export const useGetCategoriesByQueueService = createGetService<
  Category[],
  { queueId: string }
>((params) => `/v1/categories/queue/${params.queueId}`);

export const useGetCategoryService = createGetService<Category, { id: string }>(
  (params) => `/v1/categories/${params.id}`
);

export const useCreateCategoryService = createPostService<
  CategoryCreateRequest,
  Category
>("/v1/categories");

export const useUpdateCategoryService = createPatchService<
  CategoryUpdateRequest,
  Category,
  { id: string }
>((params) => `/v1/categories/${params.id}`);

export const useDeleteCategoryService = createDeleteService<
  void,
  { id: string }
>((params) => `/v1/categories/${params.id}`);
