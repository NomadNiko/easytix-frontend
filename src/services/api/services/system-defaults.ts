import {
  createGetService,
  createPostService,
  createPatchService,
  createDeleteService,
} from "../factory";

// Type definitions
export type SystemDefault = {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type SystemDefaultCreateRequest = {
  key: string;
  value: string;
  description?: string;
};

export type SystemDefaultUpdateRequest = {
  value: string;
  description?: string;
};

export type SystemDefaultsQueryParams = {
  key?: string;
};

// API Services
export const useGetSystemDefaultsService = createGetService<
  SystemDefault[],
  void,
  SystemDefaultsQueryParams
>("/v1/system-defaults", {
  formatQueryParams: (params) => {
    const searchParams = new URLSearchParams();
    if (params.key) searchParams.append("key", params.key);
    return searchParams.toString();
  },
});

export const useGetSystemDefaultService = createGetService<
  SystemDefault,
  { id: string }
>((params) => `/v1/system-defaults/${params.id}`);

export const useCreateSystemDefaultService = createPostService<
  SystemDefaultCreateRequest,
  SystemDefault
>("/v1/system-defaults");

export const useUpdateSystemDefaultService = createPatchService<
  SystemDefaultUpdateRequest,
  SystemDefault,
  { id: string }
>((params) => `/v1/system-defaults/${params.id}`);

export const useDeleteSystemDefaultService = createDeleteService<
  void,
  { id: string }
>((params) => `/v1/system-defaults/${params.id}`);

// Convenience endpoints
export const useSetDefaultQueueService = createPostService<
  void,
  SystemDefault,
  { queueId: string }
>((params) => `/v1/system-defaults/set-default-queue/${params.queueId}`);

export const useSetDefaultCategoryService = createPostService<
  void,
  SystemDefault,
  { categoryId: string }
>((params) => `/v1/system-defaults/set-default-category/${params.categoryId}`);

export const useGetCurrentDefaultQueueService = createGetService<{
  queueId: string | null;
}>("/v1/system-defaults/default-queue/current");

export const useGetCurrentDefaultCategoryService = createGetService<{
  categoryId: string | null;
}>("/v1/system-defaults/default-category/current");
