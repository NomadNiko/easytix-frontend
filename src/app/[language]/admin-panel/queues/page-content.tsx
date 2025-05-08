// src/app/[language]/admin-panel/queues/page-content.tsx
"use client";
import React, { useState } from "react";
import { Container, Title, Button, Group, Modal, Tabs } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { RoleEnum } from "@/services/api/types/role";
import RouteGuard from "@/services/auth/route-guard";
import { IconPlus } from "@tabler/icons-react";
import {
  useQueuesQuery,
  useCreateQueueMutation,
  useUpdateQueueMutation,
  useDeleteQueueMutation,
  useAssignUserToQueueMutation,
  useRemoveUserFromQueueMutation,
} from "@/app/[language]/tickets/queries/queue-queries";
import {
  QueueForm,
  QueueFormValues,
} from "@/components/tickets/queues/QueueForm";
import { QueueList } from "@/components/tickets/queues/QueueList";
import { QueueUserManagement } from "@/components/tickets/queues/QueueUserManagement";
import { CategoryManagement } from "./components/CategoryManagement";
import { Queue } from "@/services/api/services/queues";

function QueueManagement() {
  const { t } = useTranslation("tickets");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] =
    useState(false);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("queues");

  // Queries and mutations
  const { data: queuesData } = useQueuesQuery();
  const createQueueMutation = useCreateQueueMutation();
  const updateQueueMutation = useUpdateQueueMutation();
  const deleteQueueMutation = useDeleteQueueMutation();
  const assignUserMutation = useAssignUserToQueueMutation();
  const removeUserMutation = useRemoveUserFromQueueMutation();

  // Get the queues array safely, handling both response formats
  const queues = Array.isArray(queuesData)
    ? queuesData
    : queuesData?.data || [];

  // Handler functions
  const handleCreateQueue = (values: QueueFormValues) => {
    createQueueMutation.mutate(
      {
        name: values.name,
        description: values.description || "", // Use empty string as fallback
        assignedUserIds: [],
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      }
    );
  };

  const handleUpdateQueue = (values: QueueFormValues) => {
    if (!selectedQueue) return;
    updateQueueMutation.mutate(
      {
        id: selectedQueue.id,
        data: {
          name: values.name,
          description: values.description || "", // Use empty string as fallback
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedQueue(null);
        },
      }
    );
  };

  const handleDeleteQueue = (id: string) => {
    deleteQueueMutation.mutate(id);
  };

  const handleEditQueue = (queue: Queue) => {
    setSelectedQueue(queue);
    setIsEditModalOpen(true);
  };

  const handleManageQueueUsers = (queue: Queue) => {
    setSelectedQueue(queue);
    setIsUserManagementModalOpen(true);
  };

  const handleAssignUsers = (userIds: string[]) => {
    if (!selectedQueue) return;

    // First, remove all users
    const currentUserIds = selectedQueue.assignedUserIds || [];

    // Find users to remove
    const usersToRemove = currentUserIds.filter((id) => !userIds.includes(id));

    // Find users to add
    const usersToAdd = userIds.filter((id) => !currentUserIds.includes(id));

    // Remove users
    Promise.all(
      usersToRemove.map((userId) =>
        removeUserMutation.mutate({ id: selectedQueue.id, userId })
      )
    )
      .then(() => {
        // Add users
        return Promise.all(
          usersToAdd.map((userId) =>
            assignUserMutation.mutate({ id: selectedQueue.id, userId })
          )
        );
      })
      .then(() => {
        setIsUserManagementModalOpen(false);
        setSelectedQueue(null);
      });
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">
        {t("tickets:admin.queueManagement")}
      </Title>
      <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
        <Tabs.List>
          <Tabs.Tab value="queues">{t("tickets:admin.queues")}</Tabs.Tab>
          <Tabs.Tab value="categories">
            {t("tickets:admin.categories")}
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="queues" pt="md">
          <Group justify="right" mb="md">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
              size="compact-sm"
            >
              {t("tickets:queues.actions.create")}
            </Button>
          </Group>
          <QueueList
            queues={queues}
            onEdit={handleEditQueue}
            onDelete={handleDeleteQueue}
            onManageUsers={handleManageQueueUsers}
          />
        </Tabs.Panel>
        <Tabs.Panel value="categories" pt="md">
          <CategoryManagement />
        </Tabs.Panel>
      </Tabs>

      {/* Create Queue Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("tickets:queues.actions.create")}
        size="md"
      >
        <QueueForm
          onSubmit={handleCreateQueue}
          isSubmitting={createQueueMutation.isPending}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Queue Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedQueue(null);
        }}
        title={t("tickets:queues.actions.edit")}
        size="md"
      >
        {selectedQueue && (
          <QueueForm
            initialValues={{
              name: selectedQueue.name,
              description: selectedQueue.description,
            }}
            onSubmit={handleUpdateQueue}
            isSubmitting={updateQueueMutation.isPending}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedQueue(null);
            }}
          />
        )}
      </Modal>

      {/* User Management Modal */}
      <Modal
        opened={isUserManagementModalOpen}
        onClose={() => {
          setIsUserManagementModalOpen(false);
          setSelectedQueue(null);
        }}
        title={t("tickets:queues.manageUsers.title")}
        size="lg"
      >
        {selectedQueue && (
          <QueueUserManagement
            queue={selectedQueue}
            onAssignUsers={handleAssignUsers}
            isSubmitting={
              assignUserMutation.isPending || removeUserMutation.isPending
            }
            onCancel={() => {
              setIsUserManagementModalOpen(false);
              setSelectedQueue(null);
            }}
          />
        )}
      </Modal>
    </Container>
  );
}

function QueueManagementPage() {
  return (
    <RouteGuard roles={[RoleEnum.ADMIN]}>
      <QueueManagement />
    </RouteGuard>
  );
}

export default QueueManagementPage;
