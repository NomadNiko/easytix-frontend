"use client";

import { useForm, Controller } from "react-hook-form";
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Title,
  Card,
  Text,
  Box,
  Container,
  LoadingOverlay,
} from "@mantine/core";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";
import {
  TicketPriority,
  TicketCreateRequest,
} from "@/services/api/services/tickets";
import { useCreateTicketMutation } from "@/app/[language]/tickets/queries/ticket-queries";
import { QueueSelect } from "./queues/QueueSelect";
import { CategorySelect } from "./categories/CategorySelect";
import { useState } from "react";

type FormData = Omit<TicketCreateRequest, "documentIds">;

const useValidationSchema = () => {
  const { t } = useTranslation("tickets");
  return yup.object().shape({
    queueId: yup
      .string()
      .required(t("tickets:inputs.queue.validation.required")),
    categoryId: yup
      .string()
      .required(t("tickets:inputs.category.validation.required")),
    title: yup.string().required(t("tickets:inputs.title.validation.required")),
    details: yup
      .string()
      .required(t("tickets:inputs.details.validation.required")),
    priority: yup
      .mixed<TicketPriority>()
      .oneOf(Object.values(TicketPriority))
      .required(t("tickets:inputs.priority.validation.required")),
  });
};

export function AuthenticatedTicketForm() {
  const { t } = useTranslation("tickets");
  const router = useRouter();
  const createTicketMutation = useCreateTicketMutation();
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");

  const validationSchema = useValidationSchema();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      queueId: "",
      categoryId: "",
      title: "",
      details: "",
      priority: TicketPriority.MEDIUM,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const ticket = await createTicketMutation.mutateAsync({
        ...data,
        documentIds: [], // File uploads can be added after ticket creation
      });

      // Reset form
      reset();

      // Redirect to the created ticket
      router.push(`/tickets/${ticket.id}`);
    } catch (error) {
      // Error handling is done by the mutation
      console.error("Failed to create ticket:", error);
    }
  });

  const handleQueueChange = (queueId: string | null) => {
    const id = queueId || "";
    setSelectedQueueId(id);
    setValue("queueId", id);
    // Reset category when queue changes
    setValue("categoryId", "");
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setValue("categoryId", categoryId || "");
  };

  return (
    <Container size="md">
      <Box pos="relative">
        <LoadingOverlay visible={createTicketMutation.isPending} />

        <form onSubmit={onSubmit}>
          <Stack gap="lg">
            <Card withBorder shadow="sm" p="lg">
              <Title order={3} mb="md">
                {t("tickets:form.ticketDetails")}
              </Title>

              <Stack gap="md">
                <Controller
                  name="queueId"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Text size="sm" fw={500} mb="xs">
                        {t("tickets:inputs.queue.label")}
                      </Text>
                      <QueueSelect
                        value={field.value}
                        onChange={handleQueueChange}
                        error={errors.queueId?.message}
                        data-testid="queue-select"
                      />
                    </Box>
                  )}
                />

                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Text size="sm" fw={500} mb="xs">
                        {t("tickets:inputs.category.label")}
                      </Text>
                      <CategorySelect
                        queueId={selectedQueueId}
                        value={field.value}
                        onChange={handleCategoryChange}
                        error={errors.categoryId?.message}
                        disabled={!selectedQueueId}
                        data-testid="category-select"
                      />
                    </Box>
                  )}
                />

                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label={t("tickets:inputs.title.label")}
                      placeholder={t("tickets:inputs.title.placeholder")}
                      error={errors.title?.message}
                      data-testid="title-input"
                    />
                  )}
                />

                <Controller
                  name="details"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label={t("tickets:inputs.details.label")}
                      placeholder={t("tickets:inputs.details.placeholder")}
                      minRows={4}
                      error={errors.details?.message}
                      data-testid="details-input"
                    />
                  )}
                />

                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label={t("tickets:inputs.priority.label")}
                      data={[
                        {
                          value: TicketPriority.HIGH,
                          label: t("tickets:priority.high"),
                        },
                        {
                          value: TicketPriority.MEDIUM,
                          label: t("tickets:priority.medium"),
                        },
                        {
                          value: TicketPriority.LOW,
                          label: t("tickets:priority.low"),
                        },
                      ]}
                      error={errors.priority?.message}
                      data-testid="priority-select"
                    />
                  )}
                />

                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    {t("tickets:inputs.attachments.label")}
                  </Text>
                  <Text size="xs" color="dimmed" mb="xs">
                    {t("tickets:form.attachmentsNote")}
                  </Text>
                </Box>
              </Stack>
            </Card>

            <Box>
              <Button
                type="submit"
                size="md"
                fullWidth
                loading={createTicketMutation.isPending}
                data-testid="submit-button"
              >
                {t("tickets:actions.createTicket")}
              </Button>

              <Text size="xs" color="dimmed" mt="xs" ta="center">
                {t("tickets:form.createTicketNote")}
              </Text>
            </Box>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
