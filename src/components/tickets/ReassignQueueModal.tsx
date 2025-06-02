// src/components/tickets/ReassignQueueModal.tsx
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
import { useGetQueuesService } from "@/services/api/services/queues";
import { useGetCategoriesByQueueService } from "@/services/api/services/categories";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

interface ReassignQueueModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (queueId: string, categoryId: string) => void;
  currentQueueId?: string;
  currentCategoryId?: string;
  isSubmitting?: boolean;
}

interface QueueOption {
  value: string;
  label: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

export function ReassignQueueModal({
  opened,
  onClose,
  onConfirm,
  currentQueueId,
  currentCategoryId,
  isSubmitting = false,
}: ReassignQueueModalProps) {
  const { t } = useTranslation("tickets");

  // State
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [queueOptions, setQueueOptions] = useState<QueueOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isLoadingQueues, setIsLoadingQueues] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Services
  const getQueuesService = useGetQueuesService();
  const getCategoriesService = useGetCategoriesByQueueService();

  // Load queues on modal open
  useEffect(() => {
    if (opened) {
      const fetchQueues = async () => {
        setIsLoadingQueues(true);
        try {
          const { status, data } = await getQueuesService(undefined, {
            page: 1,
            limit: 50,
          });
          if (status === HTTP_CODES_ENUM.OK) {
            // Handle both response formats: direct array or {data: [], hasNextPage: boolean}
            const queuesArray = Array.isArray(data) ? data : data.data || [];
            const options = queuesArray.map((queue) => ({
              value: queue.id,
              label: queue.name,
            }));
            setQueueOptions(options);
          }
        } catch (error) {
          console.error("Error fetching queues:", error);
        } finally {
          setIsLoadingQueues(false);
        }
      };
      fetchQueues();
    }
  }, [opened, getQueuesService]);

  // Load categories when queue is selected
  useEffect(() => {
    if (selectedQueueId) {
      // Clear selected category immediately when queue changes
      setSelectedCategoryId(null);

      const fetchCategories = async () => {
        setIsLoadingCategories(true);
        try {
          const { status, data } = await getCategoriesService(
            { queueId: selectedQueueId },
            undefined
          );
          if (status === HTTP_CODES_ENUM.OK) {
            // Handle the response structure for categories
            const categoriesArray = Array.isArray(data) ? data : [];
            const options = categoriesArray.map((category) => ({
              value: category.id,
              label: category.name,
            }));
            setCategoryOptions(options);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        } finally {
          setIsLoadingCategories(false);
        }
      };
      fetchCategories();
    } else {
      setCategoryOptions([]);
      setSelectedCategoryId(null);
    }
  }, [selectedQueueId, getCategoriesService]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (opened) {
      setSelectedQueueId(currentQueueId || null);
      setSelectedCategoryId(currentCategoryId || null);
    } else {
      setSelectedQueueId(null);
      setSelectedCategoryId(null);
      setCategoryOptions([]);
    }
  }, [opened, currentQueueId, currentCategoryId]);

  const handleConfirm = () => {
    if (selectedQueueId && selectedCategoryId) {
      onConfirm(selectedQueueId, selectedCategoryId);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const isFormValid = selectedQueueId && selectedCategoryId;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("tickets:tickets.actions.reassignQueue")}
      centered
      size="md"
    >
      <LoadingOverlay visible={isSubmitting} />

      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t("tickets:tickets.actions.reassignQueueDescription")}
        </Text>

        {/* Queue Selection */}
        <Select
          label={t("tickets:tickets.fields.queue")}
          placeholder={t("tickets:tickets.filters.selectQueue")}
          data={queueOptions}
          value={selectedQueueId}
          onChange={setSelectedQueueId}
          searchable
          clearable={false}
          disabled={isLoadingQueues || isSubmitting}
          data-testid="reassign-queue-select"
          required
        />

        {/* Category Selection */}
        <Select
          label={t("tickets:tickets.fields.category")}
          placeholder={
            selectedQueueId
              ? t("tickets:tickets.filters.selectCategory")
              : t("tickets:tickets.filters.selectQueueFirst")
          }
          data={categoryOptions}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          searchable
          clearable={false}
          disabled={!selectedQueueId || isLoadingCategories || isSubmitting}
          data-testid="reassign-category-select"
          required
        />

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            onClick={handleCancel}
            disabled={isSubmitting}
            data-testid="reassign-queue-cancel"
          >
            {t("common:actions.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
            data-testid="reassign-queue-confirm"
          >
            {t("common:actions.save")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
