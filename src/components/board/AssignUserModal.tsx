"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Select,
  Button,
  Group,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { useGetUsersService } from "@/services/api/services/users";
import { useGetQueueService } from "@/services/api/services/queues";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

interface AssignUserModalProps {
  opened: boolean;
  onClose: () => void;
  onAssign: (userId: string) => void;
  queueId: string;
}

interface UserOption {
  value: string;
  label: string;
}

export function AssignUserModal({
  opened,
  onClose,
  onAssign,
  queueId,
}: AssignUserModalProps) {
  const { t } = useTranslation("board");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getUsersService = useGetUsersService();
  const getQueueService = useGetQueueService();

  // Load users assigned to the queue
  useEffect(() => {
    if (opened && queueId) {
      const fetchQueueUsers = async () => {
        setIsLoading(true);
        try {
          // Get queue details to find assigned users
          const { status, data } = await getQueueService({ id: queueId });

          if (status === HTTP_CODES_ENUM.OK && data) {
            const assignedUserIds = data.assignedUserIds || [];

            // Fetch user details for assigned users
            if (assignedUserIds.length > 0) {
              const usersResponse = await getUsersService(undefined, {
                page: 1,
                limit: 100,
                // Filter to only assigned users
              });

              if (usersResponse.status === HTTP_CODES_ENUM.OK) {
                const allUsers = Array.isArray(usersResponse.data)
                  ? usersResponse.data
                  : usersResponse.data.data || [];

                // Filter to only users assigned to this queue
                const queueUsers = allUsers.filter((user) =>
                  assignedUserIds.includes(user.id)
                );

                const options = queueUsers.map((user) => ({
                  value: user.id,
                  label: `${user.firstName} ${user.lastName}`,
                }));

                setUserOptions(options);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching queue users:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchQueueUsers();
    }
  }, [opened, queueId, getQueueService, getUsersService]);

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(selectedUserId);
      setSelectedUserId(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("board:modals.assignUser.title")}
      centered
      size="md"
    >
      <LoadingOverlay visible={isLoading} />

      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t("board:modals.assignUser.description")}
        </Text>

        <Select
          label={t("board:modals.assignUser.selectUser")}
          placeholder={t("board:modals.assignUser.userPlaceholder")}
          data={userOptions}
          value={selectedUserId}
          onChange={setSelectedUserId}
          searchable
          clearable
          disabled={isLoading}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            {t("common:actions.cancel")}
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId}>
            {t("common:actions.assign")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
