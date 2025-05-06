// src/app/[language]/admin-panel/notifications/queries/admin-notification-queries.ts
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createPostService } from "@/services/api/factory";

// Define notification types
type NotificationType = "broadcast" | "send-to-users";

// Type definitions
interface BroadcastNotificationDto {
  title: string;
  message: string;
  link?: string;
}

interface MultipleNotificationsDto {
  userIds: string[];
  title: string;
  message: string;
  link?: string;
}

// Factory for creating the appropriate service based on notification type
export const usePostAdminNotificationService = (type: NotificationType) => {
  const endpoint =
    type === "broadcast"
      ? "/v1/admin/notifications/broadcast"
      : "/v1/admin/notifications/send-to-users";

  return createPostService<
    BroadcastNotificationDto | MultipleNotificationsDto,
    void
  >(endpoint)();
};

// Custom hook for admin notification mutations
export const useAdminNotificationMutation = (type: NotificationType) => {
  const postNotification = usePostAdminNotificationService(type);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("admin-notifications");

  return useMutation({
    mutationFn: async (
      data: BroadcastNotificationDto | MultipleNotificationsDto
    ) => {
      const { status } = await postNotification(data);

      if (status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to send notification");
      }

      return;
    },
    onSuccess: () => {
      const successMessage =
        type === "broadcast"
          ? t("admin-notifications:alerts.broadcastSuccess")
          : t("admin-notifications:alerts.multipleSuccess");

      enqueueSnackbar(successMessage, { variant: "success" });
    },
    onError: () => {
      const errorMessage =
        type === "broadcast"
          ? t("admin-notifications:alerts.broadcastError")
          : t("admin-notifications:alerts.multipleError");

      enqueueSnackbar(errorMessage, { variant: "error" });
    },
  });
};
