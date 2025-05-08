// src/components/tickets/TicketForm.tsx
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Paper,
  Title,
  Select,
  Box,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { QueueSelect } from "./queues/QueueSelect";
import { CategorySelect } from "./categories/CategorySelect";
import { TicketPriority } from "@/services/api/services/tickets";
import { FileEntity } from "@/services/api/types/file-entity";
import { FilePicker } from "./FilePicker";

export interface TicketFormValues {
  queueId: string;
  categoryId: string;
  title: string;
  details: string;
  priority: TicketPriority;
  file?: FileEntity | null;
}

interface TicketFormProps {
  initialValues?: Partial<TicketFormValues>;
  onSubmit: (values: TicketFormValues) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function TicketForm({
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: TicketFormProps) {
  const { t } = useTranslation("tickets");
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(
    initialValues?.queueId || null
  );
  const [selectedFile, setSelectedFile] = useState<FileEntity | null>(
    initialValues?.file || null
  );

  const { control, handleSubmit, setValue } = useForm<TicketFormValues>({
    defaultValues: {
      queueId: initialValues?.queueId || "",
      categoryId: initialValues?.categoryId || "",
      title: initialValues?.title || "",
      details: initialValues?.details || "",
      priority: initialValues?.priority || TicketPriority.MEDIUM,
      file: initialValues?.file || null,
    },
  });

  const priorityOptions = [
    { value: TicketPriority.HIGH, label: t("tickets:tickets.priorities.high") },
    {
      value: TicketPriority.MEDIUM,
      label: t("tickets:tickets.priorities.medium"),
    },
    { value: TicketPriority.LOW, label: t("tickets:tickets.priorities.low") },
  ];

  const handleQueueChange = (queueId: string | null) => {
    setSelectedQueueId(queueId);
    setValue("queueId", queueId || "");
    // Reset category when queue changes
    setValue("categoryId", "");
  };

  const handleFileChange = (file: FileEntity | null) => {
    setSelectedFile(file);
    setValue("file", file);
  };

  // Type assertion to avoid TS errors
  const submitHandler = (data: TicketFormValues) => {
    // Make sure file field is included
    const submissionData = {
      ...data,
      file: selectedFile,
    };
    onSubmit(submissionData);
  };

  return (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">
        {initialValues
          ? t("tickets:tickets.editTicket")
          : t("tickets:tickets.createTicket")}
      </Title>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Controller
          name="queueId"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <QueueSelect
              value={field.value}
              onChange={(value) => handleQueueChange(value)}
              error={fieldState.error?.message}
              required
            />
          )}
        />
        <Controller
          name="categoryId"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <CategorySelect
              queueId={selectedQueueId}
              value={field.value}
              onChange={(value) => field.onChange(value)}
              error={fieldState.error?.message}
              required
              disabled={!selectedQueueId}
            />
          )}
        />
        <Controller
          name="title"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <TextInput
              label={t("tickets:tickets.fields.title")}
              placeholder={t("tickets:tickets.placeholders.title")}
              error={fieldState.error?.message}
              required
              mt="md"
              {...field}
            />
          )}
        />
        <Controller
          name="priority"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Select
              label={t("tickets:tickets.fields.priority")}
              placeholder={t("tickets:tickets.placeholders.priority")}
              data={priorityOptions}
              error={fieldState.error?.message}
              required
              mt="md"
              {...field}
            />
          )}
        />
        <Controller
          name="details"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Textarea
              label={t("tickets:tickets.fields.details")}
              placeholder={t("tickets:tickets.placeholders.details")}
              error={fieldState.error?.message}
              required
              minRows={4}
              mt="md"
              {...field}
            />
          )}
        />

        {/* File Picker using our custom component */}
        <Box mt="md">
          <FilePicker
            value={selectedFile}
            onChange={handleFileChange}
            label={t("tickets:tickets.fields.attachment")}
            disabled={isSubmitting}
          />
        </Box>

        <Group justify="flex-end" mt="xl">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              size="compact-sm"
            >
              {t("common:actions.cancel")}
            </Button>
          )}
          <Button type="submit" loading={isSubmitting} size="compact-sm">
            {initialValues
              ? t("common:actions.update")
              : t("common:actions.create")}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
