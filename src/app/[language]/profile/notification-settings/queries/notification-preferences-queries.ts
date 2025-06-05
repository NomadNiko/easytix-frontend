import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useTranslation } from "@/services/i18n/client";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import useAuth from "@/services/auth/use-auth";
import {
  useGetUserNotificationPreferencesService,
  useUpdateUserNotificationPreferencesService,
} from "@/services/api/services/users";

interface NotificationPreferences {
  [key: string]: {
    email: boolean;
    notification: boolean;
  };
}

export const useGetNotificationPreferencesQuery = (userId?: string) => {
  const getUserNotificationPreferencesService =
    useGetUserNotificationPreferencesService();

  return useQuery({
    queryKey: ["notificationPreferences", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { status, data } = await getUserNotificationPreferencesService({
        id: userId,
      });

      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to fetch notification preferences");
      }

      return data;
    },
    enabled: !!userId,
  });
};

export const useUpdateNotificationPreferencesMutation = () => {
  const updateUserNotificationPreferencesService =
    useUpdateUserNotificationPreferencesService();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("profile");
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { status, data } = await updateUserNotificationPreferencesService(
        preferences,
        { id: user.id }
      );

      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to update notification preferences");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Update the cache with the new preferences
      if (user?.id) {
        queryClient.setQueryData(
          ["notificationPreferences", user.id],
          (old: NotificationPreferences | undefined) => ({
            ...old,
            ...variables,
          })
        );
      }

      enqueueSnackbar(t("profile:notificationSettings.alerts.updated"), {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(t("profile:notificationSettings.alerts.error"), {
        variant: "error",
      });
    },
  });
};
