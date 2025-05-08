// src/components/tickets/queues/QueueList.tsx
import React from "react";
import { Table, Group, ActionIcon, Badge, Text, Card } from "@mantine/core";
import { IconEdit, IconTrash, IconUsers } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { Queue } from "@/services/api/services/queues";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";

interface QueueListProps {
  queues: Queue[];
  onEdit: (queue: Queue) => void;
  onDelete: (id: string) => void;
  onManageUsers: (queue: Queue) => void;
}

export function QueueList({
  queues,
  onEdit,
  onDelete,
  onManageUsers,
}: QueueListProps) {
  const { t } = useTranslation("tickets");
  const { confirmDialog } = useConfirmDialog();

  const handleDelete = async (queue: Queue) => {
    const confirmed = await confirmDialog({
      title: t("tickets:queues.confirmDelete.title"),
      message: t("tickets:queues.confirmDelete.message", { name: queue.name }),
    });

    if (confirmed) {
      onDelete(queue.id);
    }
  };

  if (queues.length === 0) {
    return (
      <Card withBorder p="xl" radius="md" my="md">
        <Text ta="center" fw={500} c="dimmed">
          {t("tickets:queues.empty")}
        </Text>
      </Card>
    );
  }

  return (
    <div>
      <Table horizontalSpacing="sm" verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("tickets:queues.fields.name")}</Table.Th>
            <Table.Th>{t("tickets:queues.fields.assignedUsers")}</Table.Th>
            <Table.Th>{t("common:fields.actions")}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {queues.map((queue) => (
            <Table.Tr key={queue.id}>
              <Table.Td>
                <Group>
                  <div>
                    <Text size="sm" fw={500}>
                      {queue.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {queue.description}
                    </Text>
                  </div>
                </Group>
              </Table.Td>
              <Table.Td>
                <Badge>
                  {queue.assignedUserIds.length} {t("tickets:queues.users")}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    onClick={() => onEdit(queue)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="blue"
                    onClick={() => onManageUsers(queue)}
                  >
                    <IconUsers size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(queue)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
