// ./easytix-frontend/src/services/api/services/files-general.ts
import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { FileEntity } from "../types/file-entity";
import { RequestConfigType } from "./types/request-config";
import HTTP_CODES_ENUM from "../types/http-codes";

export type FileGeneralUploadRequest = File;
export type FileGeneralUploadResponse = {
  file: FileEntity;
  uploadSignedUrl?: string;
};

export function useFileGeneralUploadService() {
  const fetchClient = useFetch();
  return useCallback(
    async (
      data: FileGeneralUploadRequest,
      requestConfig?: RequestConfigType
    ) => {
      if (process.env.NEXT_PUBLIC_FILE_DRIVER === "s3-presigned") {
        const result = await fetchClient(`${API_URL}/v1/files/general/upload`, {
          method: "POST",
          body: JSON.stringify({
            fileName: data.name,
            fileSize: data.size,
          }),
          ...requestConfig,
        }).then(wrapperFetchJsonResponse<FileGeneralUploadResponse>);
        if (
          result.status === HTTP_CODES_ENUM.CREATED &&
          result.data.uploadSignedUrl
        ) {
          await fetch(result.data.uploadSignedUrl, {
            method: "PUT",
            body: data,
            headers: {
              "Content-Type": data.type,
            },
          });
        }
        return result;
      } else {
        const formData = new FormData();
        formData.append("file", data);
        return fetchClient(`${API_URL}/v1/files/general/upload`, {
          method: "POST",
          body: formData,
          ...requestConfig,
        }).then(wrapperFetchJsonResponse<FileGeneralUploadResponse>);
      }
    },
    [fetchClient]
  );
}
