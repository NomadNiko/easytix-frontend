// src/services/api/services/files-general.ts
import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { FileEntity } from "../types/file-entity";
import { RequestConfigType } from "./types/request-config";

export type FileGeneralUploadRequest = File;
export type FileGeneralUploadResponse = {
  file: FileEntity;
};

export function useFileGeneralUploadService() {
  const fetchClient = useFetch();
  return useCallback(
    async (
      data: FileGeneralUploadRequest,
      requestConfig?: RequestConfigType
    ) => {
      // Create FormData for file upload - this works for both local and S3
      const formData = new FormData();
      formData.append("file", data);

      // Use consistent upload approach for all storage drivers
      return fetchClient(`${API_URL}/v1/files/general/upload`, {
        method: "POST",
        body: formData,
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<FileGeneralUploadResponse>);
    },
    [fetchClient]
  );
}
