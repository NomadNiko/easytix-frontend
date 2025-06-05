// src/app/[language]/admin-panel/notifications/page-content.tsx
"use client";
import {
  Container,
  Title,
  Stack,
  Tabs,
  TextInput,
  Textarea,
  Button,
  Group,
  Text,
  Paper,
  MultiSelect,
  Box,
} from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import { RoleEnum } from "@/services/api/types/role";
import RouteGuard from "@/services/auth/route-guard";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { usePostAdminNotificationService } from "./queries/admin-notification-queries";
import { useGetUsersQuery } from "../users/queries/queries";

// Form types
type BroadcastNotificationForm = {
  title: string;
  message: string;
  link?: string;
  linkLabel?: string;
};

type MultipleNotificationForm = {
  userIds: string[];
  title: string;
  message: string;
  link?: string;
  linkLabel?: string;
};

function AdminNotificationsContent() {
  const { t } = useTranslation("admin-notifications");
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState<string | null>("broadcast");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Get users for the multi-select
  const { data: usersData } = useGetUsersQuery();

  // Format users for multi-select
  const userOptions =
    usersData?.pages
      .flatMap((page) => page.data)
      .map((user) => ({
        value: user.id.toString(),
        label: `${user.firstName} ${user.lastName} (${user.email})`,
      })) || [];

  // API services
  const broadcastNotification = usePostAdminNotificationService("broadcast");
  const sendToMultipleUsers = usePostAdminNotificationService("send-to-users");

  // Broadcast form
  const broadcastForm = useForm<BroadcastNotificationForm>({
    defaultValues: {
      title: "",
      message: "",
      link: "",
      linkLabel: "",
    },
  });

  // Multiple users form
  const multipleForm = useForm<MultipleNotificationForm>({
    defaultValues: {
      userIds: [],
      title: "",
      message: "",
      link: "",
      linkLabel: "",
    },
  });

  // Handle broadcast form submission
  const handleBroadcastSubmit = async (data: BroadcastNotificationForm) => {
    try {
      await broadcastNotification(data);
      enqueueSnackbar(t("admin-notifications:alerts.broadcastSuccess"), {
        variant: "success",
      });
      broadcastForm.reset();
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      enqueueSnackbar(t("admin-notifications:alerts.broadcastError"), {
        variant: "error",
      });
    }
  };

  // Handle multiple users form submission
  const handleMultipleSubmit = async (data: MultipleNotificationForm) => {
    try {
      await sendToMultipleUsers({
        ...data,
        userIds: selectedUsers,
      });
      enqueueSnackbar(t("admin-notifications:alerts.multipleSuccess"), {
        variant: "success",
      });
      multipleForm.reset();
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error sending notifications to users:", error);
      enqueueSnackbar(t("admin-notifications:alerts.multipleError"), {
        variant: "error",
      });
    }
  };

  return (
    <Container size="md">
      <Stack gap="lg" py="lg">
        <Title order={3}>{t("admin-notifications:title")}</Title>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="broadcast">
              {t("admin-notifications:tabs.broadcast")}
            </Tabs.Tab>
            <Tabs.Tab value="multiple">
              {t("admin-notifications:tabs.multiple")}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="broadcast">
            <Paper p="md" withBorder mt="md">
              <form
                onSubmit={broadcastForm.handleSubmit(handleBroadcastSubmit)}
              >
                <Stack gap="md">
                  <Text fw={500}>
                    {t("admin-notifications:broadcast.description")}
                  </Text>
                  <Controller
                    name="title"
                    control={broadcastForm.control}
                    rules={{
                      required: t(
                        "admin-notifications:validation.titleRequired"
                      ),
                    }}
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        label={t("admin-notifications:fields.title")}
                        placeholder={t(
                          "admin-notifications:placeholders.title"
                        )}
                        error={fieldState.error?.message}
                        required
                      />
                    )}
                  />
                  <Controller
                    name="message"
                    control={broadcastForm.control}
                    rules={{
                      required: t(
                        "admin-notifications:validation.messageRequired"
                      ),
                    }}
                    render={({ field, fieldState }) => (
                      <Textarea
                        {...field}
                        label={t("admin-notifications:fields.message")}
                        placeholder={t(
                          "admin-notifications:placeholders.message"
                        )}
                        minRows={4}
                        error={fieldState.error?.message}
                        required
                      />
                    )}
                  />
                  <Controller
                    name="link"
                    control={broadcastForm.control}
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        label={t("admin-notifications:fields.link")}
                        placeholder={t("admin-notifications:placeholders.link")}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="linkLabel"
                    control={broadcastForm.control}
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        label={t("admin-notifications:fields.linkLabel")}
                        placeholder={t(
                          "admin-notifications:placeholders.linkLabel"
                        )}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Group justify="right" mt="md">
                    <Button
                      type="submit"
                      loading={broadcastForm.formState.isSubmitting}
                    >
                      {t("admin-notifications:actions.send")}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          </Tabs.Panel>
          <Tabs.Panel value="multiple">
            <Paper p="md" withBorder mt="md">
              <form onSubmit={multipleForm.handleSubmit(handleMultipleSubmit)}>
                <Stack gap="md">
                  <Text fw={500}>
                    {t("admin-notifications:multiple.description")}
                  </Text>
                  <Box>
                    <Text size="sm" fw={500} mb={5}>
                      {t("admin-notifications:fields.users")}
                    </Text>
                    <MultiSelect
                      data={userOptions}
                      value={selectedUsers}
                      onChange={setSelectedUsers}
                      placeholder={t("admin-notifications:placeholders.users")}
                      searchable
                      required
                    />
                    {selectedUsers.length === 0 && (
                      <Text color="red" size="xs" mt={5}>
                        {t("admin-notifications:validation.usersRequired")}
                      </Text>
                    )}
                  </Box>
                  <Controller
                    name="title"
                    control={multipleForm.control}
                    rules={{
                      required: t(
                        "admin-notifications:validation.titleRequired"
                      ),
                    }}
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        label={t("admin-notifications:fields.title")}
                        placeholder={t(
                          "admin-notifications:placeholders.title"
                        )}
                        error={fieldState.error?.message}
                        required
                      />
                    )}
                  />
                  <Controller
                    name="message"
                    control={multipleForm.control}
                    rules={{
                      required: t(
                        "admin-notifications:validation.messageRequired"
                      ),
                    }}
                    render={({ field, fieldState }) => (
                      <Textarea
                        {...field}
                        label={t("admin-notifications:fields.message")}
                        placeholder={t(
                          "admin-notifications:placeholders.message"
                        )}
                        minRows={4}
                        error={fieldState.error?.message}
                        required
                      />
                    )}
                  />
                  <Controller
                    name="link"
                    control={multipleForm.control}
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        label={t("admin-notifications:fields.link")}
                        placeholder={t("admin-notifications:placeholders.link")}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="linkLabel"
                    control={multipleForm.control}
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        label={t("admin-notifications:fields.linkLabel")}
                        placeholder={t(
                          "admin-notifications:placeholders.linkLabel"
                        )}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Group justify="right" mt="md">
                    <Button
                      type="submit"
                      loading={multipleForm.formState.isSubmitting}
                      disabled={selectedUsers.length === 0}
                    >
                      {t("admin-notifications:actions.send")}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}

function AdminNotificationsPage() {
  return (
    <RouteGuard roles={[RoleEnum.ADMIN]}>
      <AdminNotificationsContent />
    </RouteGuard>
  );
}

export default AdminNotificationsPage;
