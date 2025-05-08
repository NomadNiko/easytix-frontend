// src/app/[language]/admin-panel/queues/components/CategoryManagement.tsx
import React, { useState } from "react";
import {
  Title,
  Button,
  Group,
  Modal,
  Select,
  Box,
  Text,
  Paper,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { IconPlus } from "@tabler/icons-react";
import { useQueuesQuery } from "@/app/[language]/tickets/queries/queue-queries";
import {
  useCategoriesByQueueQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/app/[language]/tickets/queries/category-queries";
import { CategoryForm } from "@/components/tickets/categories/CategoryForm";
import { CategoryList } from "@/components/tickets/categories/CategoryList";
import { Category } from "@/services/api/services/categories";

export function CategoryManagement() {
  const { t } = useTranslation("tickets");
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Queries and mutations
  const { data: queuesData, isLoading: isQueuesLoading } = useQueuesQuery();
  const { data: categories } = useCategoriesByQueueQuery(
    selectedQueueId || "",
    !!selectedQueueId
  );
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  // Handler functions
  const handleCreateCategory = (values: { name: string }) => {
    if (!selectedQueueId) return;
    createCategoryMutation.mutate(
      {
        queueId: selectedQueueId,
        name: values.name,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      }
    );
  };

  const handleUpdateCategory = (values: { name: string }) => {
    if (!selectedCategory || !selectedQueueId) return;
    updateCategoryMutation.mutate(
      {
        id: selectedCategory.id,
        data: values,
        queueId: selectedQueueId,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        },
      }
    );
  };

  const handleDeleteCategory = (id: string) => {
    if (!selectedQueueId) return;
    deleteCategoryMutation.mutate({ id, queueId: selectedQueueId });
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // Fixed: Properly handle undefined data by providing a fallback empty array
  const queueOptions = (queuesData?.data || []).map((queue) => ({
    value: queue.id,
    label: queue.name,
  }));

  return (
    <Box>
      <Paper withBorder p="md" mb="lg">
        <Title order={5} mb="md">
          {t("tickets:categories.selectQueue")}
        </Title>
        <Select
          placeholder={t("tickets:categories.selectQueuePlaceholder")}
          data={queueOptions}
          value={selectedQueueId}
          onChange={setSelectedQueueId}
          searchable
          clearable
          disabled={isQueuesLoading}
        />
      </Paper>
      {selectedQueueId && (
        <>
          <Group justify="right" mb="md">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
              size="compact-sm"
            >
              {t("tickets:categories.actions.create")}
            </Button>
          </Group>
          <CategoryList
            categories={categories || []}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </>
      )}
      {!selectedQueueId && (
        <Paper withBorder p="xl" radius="md">
          <Text ta="center" fw={500} c="dimmed">
            {t("tickets:categories.selectQueueFirst")}
          </Text>
        </Paper>
      )}
      {/* Create Category Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("tickets:categories.actions.create")}
        size="md"
      >
        {selectedQueueId && (
          <CategoryForm
            queueId={selectedQueueId}
            onSubmit={handleCreateCategory}
            isSubmitting={createCategoryMutation.isPending}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        )}
      </Modal>
      {/* Edit Category Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        title={t("tickets:categories.actions.edit")}
        size="md"
      >
        {selectedQueueId && selectedCategory && (
          <CategoryForm
            queueId={selectedQueueId}
            initialValues={{
              name: selectedCategory.name,
            }}
            onSubmit={handleUpdateCategory}
            isSubmitting={updateCategoryMutation.isPending}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedCategory(null);
            }}
          />
        )}
      </Modal>
    </Box>
  );
}
