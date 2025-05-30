"use client";
import {
  Modal,
  Stack,
  Text,
  Button,
  Loader,
  Center,
  Checkbox,
  Group,
} from "@mantine/core";
import {
  useGetQueuesService,
  useAssignUserToQueueService,
  useRemoveUserFromQueueService,
} from "@/services/api/services/queues";
import { useState, useEffect } from "react";
import { User } from "@/services/api/types/user";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";

interface UserQueuesModalProps {
  user: User;
  opened: boolean;
  onClose: () => void;
}

interface Queue {
  id: string;
  name: string;
  description?: string;
  assignedUserIds?: string[];
}

export function UserQueuesModal({
  user,
  opened,
  onClose,
}: UserQueuesModalProps) {
  // const { t } = useTranslation("admin-panel-users");
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedQueues, setSelectedQueues] = useState<string[]>([]);
  const [originalQueues, setOriginalQueues] = useState<string[]>([]);
  const getQueuesService = useGetQueuesService();
  const assignUserToQueueService = useAssignUserToQueueService();
  const removeUserFromQueueService = useRemoveUserFromQueueService();
  const { enqueueSnackbar } = useSnackbar();

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const response = await getQueuesService(undefined, {
        page: 1,
        limit: 100,
      });

      if (response.status === 200 && response.data) {
        // Handle both response formats: direct array or {data: [], hasNextPage: boolean}
        const allQueues = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setQueues(allQueues);

        // Set initially selected queues based on user assignments
        const userQueues = allQueues
          .filter((queue: Queue) => queue.assignedUserIds?.includes(user.id))
          .map((queue: Queue) => queue.id);
        setSelectedQueues(userQueues);
        setOriginalQueues(userQueues);
      }
    } catch (error) {
      console.error("Error fetching queues:", error);
      setQueues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened) {
      fetchQueues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleQueueToggle = (queueId: string) => {
    setSelectedQueues((prev) => {
      if (prev.includes(queueId)) {
        return prev.filter((id) => id !== queueId);
      } else {
        return [...prev, queueId];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Find queues to add (selected but not originally assigned)
      const queuesToAdd = selectedQueues.filter(
        (queueId) => !originalQueues.includes(queueId)
      );

      // Find queues to remove (originally assigned but not selected)
      const queuesToRemove = originalQueues.filter(
        (queueId) => !selectedQueues.includes(queueId)
      );

      // Execute all assignments and removals
      const promises = [];

      // Add user to new queues
      for (const queueId of queuesToAdd) {
        promises.push(
          assignUserToQueueService({ userId: user.id }, { id: queueId })
        );
      }

      // Remove user from queues
      for (const queueId of queuesToRemove) {
        promises.push(
          removeUserFromQueueService({ id: queueId, userId: user.id })
        );
      }

      await Promise.all(promises);

      enqueueSnackbar("Queue assignments updated successfully", {
        variant: "success",
      });

      // Refresh the data to get updated assignments
      await fetchQueues();

      onClose();
    } catch (error) {
      console.error("Error updating queue assignments:", error);
      enqueueSnackbar("Failed to update queue assignments", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={500}>
          Manage Queues for {user.firstName} {user.lastName}
        </Text>
      }
      size="md"
    >
      <Stack gap="md">
        {loading ? (
          <Center py="xl">
            <Loader size="md" />
          </Center>
        ) : queues.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            No queues available.
          </Text>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              Select the queues this user should be assigned to:
            </Text>
            <Stack gap="sm">
              {queues.map((queue) => (
                <Checkbox
                  key={queue.id}
                  label={
                    <div>
                      <Text fw={500}>{queue.name}</Text>
                      {queue.description && (
                        <Text size="xs" c="dimmed">
                          {queue.description}
                        </Text>
                      )}
                    </div>
                  }
                  checked={selectedQueues.includes(queue.id)}
                  onChange={() => handleQueueToggle(queue.id)}
                />
              ))}
            </Stack>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
