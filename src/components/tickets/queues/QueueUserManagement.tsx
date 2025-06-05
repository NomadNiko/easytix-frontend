// src/components/tickets/queues/QueueUserManagement.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Title,
  MultiSelect,
  Button,
  Group,
  Text,
  Divider,
  Box,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { Queue } from "@/services/api/services/queues";
import { useGetUsersService } from "@/services/api/services/users";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

interface QueueUserManagementProps {
  queue: Queue;
  onAssignUsers: (userIds: string[]) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function QueueUserManagement({
  queue,
  onAssignUsers,
  isSubmitting,
  onCancel,
}: QueueUserManagementProps) {
  const { t } = useTranslation("tickets");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const getUsersService = useGetUsersService();

  useEffect(() => {
    // Initialize selected users from queue
    setSelectedUserIds(queue.assignedUserIds || []);

    // Load users
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { status, data } = await getUsersService(undefined, {
          page: 1,
          limit: 50,
        });
        if (status === HTTP_CODES_ENUM.OK) {
          const options = data.data.map((user) => ({
            value: user.id.toString(),
            label: `${user.firstName} ${user.lastName} (${user.email})`,
          }));
          setUserOptions(options);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [queue, getUsersService]);

  const handleSave = () => {
    onAssignUsers(selectedUserIds);
  };

  return (
    <Card withBorder p="md">
      <Title order={4} mb="md">
        {t("tickets:queues.manageUsers.title")}
      </Title>
      <Text size="sm" mb="md">
        {t("tickets:queues.manageUsers.description")}
      </Text>
      <Divider my="md" />
      <Box mb="xl">
        <MultiSelect
          label={t("tickets:queues.manageUsers.selectUsers")}
          placeholder={t("tickets:queues.manageUsers.selectUsersPlaceholder")}
          data={userOptions}
          value={selectedUserIds}
          onChange={setSelectedUserIds}
          searchable
          nothingFoundMessage={t("common:nothingFound")}
          disabled={isLoading || isSubmitting}
        />
      </Box>
      <Group justify="flex-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          size="compact-sm"
        >
          {t("common:actions.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          loading={isSubmitting}
          disabled={isLoading}
          size="compact-sm"
        >
          {t("common:actions.save")}
        </Button>
      </Group>
    </Card>
  );
}
