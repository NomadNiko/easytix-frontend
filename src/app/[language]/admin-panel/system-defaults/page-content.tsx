"use client";

import { useState } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Button,
  Select,
  Group,
  Alert,
  LoadingOverlay,
  Stack,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  useGetCurrentDefaultQueueService,
  useGetCurrentDefaultCategoryService,
  useSetDefaultQueueService,
  useSetDefaultCategoryService,
} from "@/services/api/services/system-defaults";
import { useGetQueuesService } from "@/services/api/services/queues";
import { useGetCategoriesByQueueService } from "@/services/api/services/categories";

export default function SystemDefaultsPageContent() {
  const queryClient = useQueryClient();
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // API services
  const getCurrentDefaultQueue = useGetCurrentDefaultQueueService();
  const getCurrentDefaultCategory = useGetCurrentDefaultCategoryService();
  const getQueues = useGetQueuesService();
  const getCategoriesByQueue = useGetCategoriesByQueueService();
  const setDefaultQueue = useSetDefaultQueueService();
  const setDefaultCategory = useSetDefaultCategoryService();

  // Queries
  const { data: currentDefaultQueue, isLoading: loadingCurrentQueue } =
    useQuery({
      queryKey: ["current-default-queue"],
      queryFn: () => getCurrentDefaultQueue(),
    });

  const { data: currentDefaultCategory, isLoading: loadingCurrentCategory } =
    useQuery({
      queryKey: ["current-default-category"],
      queryFn: () => getCurrentDefaultCategory(),
    });

  const {
    data: queuesResponse,
    isLoading: loadingQueues,
    error: queuesError,
  } = useQuery({
    queryKey: ["queues", { page: 1, limit: 100 }],
    queryFn: () => getQueues(undefined, { page: 1, limit: 100 }),
  });

  // Get the actual MongoDB ID for the selected queue
  const selectedQueue =
    queuesResponse &&
    "data" in queuesResponse &&
    Array.isArray(queuesResponse.data)
      ? queuesResponse.data.find((q) => q.customId === selectedQueueId)
      : null;

  // Get the default queue object for loading its categories
  const defaultQueueCustomId =
    currentDefaultQueue &&
    "data" in currentDefaultQueue &&
    currentDefaultQueue.data &&
    "queueId" in currentDefaultQueue.data
      ? currentDefaultQueue.data.queueId
      : null;
  const defaultQueue =
    queuesResponse &&
    "data" in queuesResponse &&
    Array.isArray(queuesResponse.data)
      ? queuesResponse.data.find((q) => q.customId === defaultQueueCustomId)
      : null;

  const { data: categoriesResponse, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", selectedQueue?.id],
    queryFn: () => getCategoriesByQueue({ queueId: selectedQueue!.id }),
    enabled: !!selectedQueue?.id,
  });

  // Load categories for the default queue to show proper category name
  const { data: defaultCategoriesResponse } = useQuery({
    queryKey: ["default-categories", defaultQueue?.id],
    queryFn: () => getCategoriesByQueue({ queueId: defaultQueue!.id }),
    enabled: !!defaultQueue?.id,
  });

  // Mutations
  const setQueueMutation = useMutation({
    mutationFn: (queueId: string) => setDefaultQueue(undefined, { queueId }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Default queue updated successfully",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      queryClient.invalidateQueries({ queryKey: ["current-default-queue"] });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to update default queue",
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    },
  });

  const setCategoryMutation = useMutation({
    mutationFn: (categoryId: string) =>
      setDefaultCategory(undefined, { categoryId }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Default category updated successfully",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      queryClient.invalidateQueries({ queryKey: ["current-default-category"] });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to update default category",
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    },
  });

  const handleQueueChange = (customId: string | null) => {
    setSelectedQueueId(customId);
    setSelectedCategoryId(null); // Reset category when queue changes
  };

  const handleSetDefaultQueue = () => {
    if (selectedQueueId) {
      setQueueMutation.mutate(selectedQueueId);
    }
  };

  const handleSetDefaultCategory = () => {
    if (selectedCategoryId) {
      setCategoryMutation.mutate(selectedCategoryId);
    }
  };

  const getCurrentQueueName = () => {
    if (
      !currentDefaultQueue ||
      !("data" in currentDefaultQueue) ||
      !currentDefaultQueue.data
    ) {
      return "Not configured";
    }
    const queueData = currentDefaultQueue.data;
    if (!queueData || !("queueId" in queueData) || !queueData.queueId) {
      return "Not configured";
    }

    // Get queues from the wrapped response
    const queuesArray =
      queuesResponse &&
      "data" in queuesResponse &&
      Array.isArray(queuesResponse.data)
        ? queuesResponse.data
        : [];

    const queue = queuesArray.find((q) => q.customId === queueData.queueId);
    return queue?.name || `Queue ID: ${queueData.queueId}`;
  };

  const getCurrentCategoryName = () => {
    if (
      !currentDefaultCategory ||
      !("data" in currentDefaultCategory) ||
      !currentDefaultCategory.data
    ) {
      return "Not configured";
    }
    const categoryData = currentDefaultCategory.data;
    if (
      !categoryData ||
      !("categoryId" in categoryData) ||
      !categoryData.categoryId
    ) {
      return "Not configured";
    }

    // Try to find the category name from the default queue's categories first
    if (
      defaultCategoriesResponse &&
      "data" in defaultCategoriesResponse &&
      Array.isArray(defaultCategoriesResponse.data)
    ) {
      const category = defaultCategoriesResponse.data.find(
        (cat) => cat.customId === categoryData.categoryId
      );
      if (category) {
        return category.name;
      }
    }

    // Fallback to currently selected categories if available
    if (
      categoriesResponse &&
      "data" in categoriesResponse &&
      Array.isArray(categoriesResponse.data)
    ) {
      const category = categoriesResponse.data.find(
        (cat) => cat.customId === categoryData.categoryId
      );
      if (category) {
        return category.name;
      }
    }

    // Fallback to showing the ID if we can't find the name
    return `Category ID: ${categoryData.categoryId}`;
  };

  const isLoading =
    loadingCurrentQueue || loadingCurrentCategory || loadingQueues;

  // Debug logging
  console.log("Queues response:", queuesResponse);
  console.log("Queues error:", queuesError);
  console.log("Loading queues:", loadingQueues);

  return (
    <Container size="md">
      <LoadingOverlay visible={isLoading} />

      {queuesError && (
        <Alert color="red" mb="md">
          Error loading queues: {queuesError.message}
        </Alert>
      )}

      <Title order={2} mb="xl">
        System Defaults Configuration
      </Title>

      <Alert icon={<IconInfoCircle size={16} />} mb="xl">
        Configure system-wide defaults for public ticket submissions. These
        settings determine which queue and category are automatically assigned
        when anonymous users submit tickets.
      </Alert>

      <Stack gap="lg">
        {/* Current Defaults Display */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Current Defaults
          </Title>
          <Group gap="xl">
            <div>
              <Text size="sm" c="dimmed">
                Default Queue
              </Text>
              <Text fw={500}>{getCurrentQueueName()}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Default Category
              </Text>
              <Text fw={500}>{getCurrentCategoryName()}</Text>
            </div>
          </Group>
        </Card>

        {/* Set Default Queue */}
        <Card withBorder p="md">
          <Title order={4} mb="md">
            Set Default Queue
          </Title>
          <Group align="end">
            <Select
              label="Select Queue"
              placeholder="Choose a queue to set as default"
              data={
                queuesResponse &&
                "data" in queuesResponse &&
                Array.isArray(queuesResponse.data)
                  ? queuesResponse.data.map((queue) => ({
                      value: queue.customId,
                      label: queue.name,
                    }))
                  : []
              }
              value={selectedQueueId}
              onChange={handleQueueChange}
              style={{ flex: 1 }}
              disabled={loadingQueues}
              comboboxProps={{
                withinPortal: true,
                position: "bottom",
                zIndex: 1000,
              }}
            />
            <Button
              onClick={handleSetDefaultQueue}
              disabled={!selectedQueueId || setQueueMutation.isPending}
              loading={setQueueMutation.isPending}
            >
              Set as Default Queue
            </Button>
          </Group>
        </Card>

        {/* Set Default Category */}
        <Card withBorder p="md">
          <Title order={4} mb="md">
            Set Default Category
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            First select a queue above to see its categories
          </Text>
          <Group align="end">
            <Select
              label="Select Category"
              placeholder={
                selectedQueueId ? "Choose a category" : "Select a queue first"
              }
              data={
                categoriesResponse &&
                "data" in categoriesResponse &&
                Array.isArray(categoriesResponse.data)
                  ? categoriesResponse.data.map((category) => ({
                      value: category.customId,
                      label: category.name,
                    }))
                  : []
              }
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              style={{ flex: 1 }}
              disabled={!selectedQueueId || loadingCategories}
              comboboxProps={{
                withinPortal: true,
                position: "bottom",
                zIndex: 1000,
              }}
            />
            <Button
              onClick={handleSetDefaultCategory}
              disabled={!selectedCategoryId || setCategoryMutation.isPending}
              loading={setCategoryMutation.isPending}
            >
              Set as Default Category
            </Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
