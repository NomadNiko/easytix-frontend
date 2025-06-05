// src/components/tickets/queues/QueueForm.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextInput, Textarea, Button, Group, Box } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";

export interface QueueFormValues {
  name: string;
  description?: string; // Make description optional
}

interface QueueFormProps {
  initialValues?: QueueFormValues;
  onSubmit: (values: QueueFormValues) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function QueueForm({
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: QueueFormProps) {
  const { t } = useTranslation("tickets");

  const validationSchema = yup.object().shape({
    name: yup.string().required(t("tickets:queues.validation.nameRequired")),
    description: yup.string(),
  });

  const { control, handleSubmit } = useForm<QueueFormValues>({
    defaultValues: initialValues || {
      name: "",
      description: "",
    },
    resolver: yupResolver(validationSchema),
  });

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label={t("tickets:queues.fields.name")}
              placeholder={t("tickets:queues.placeholders.name")}
              error={fieldState.error?.message}
              required
              mb="md"
              {...field}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Textarea
              label={t("tickets:queues.fields.description")}
              placeholder={t("tickets:queues.placeholders.description")}
              error={fieldState.error?.message}
              mb="xl"
              {...field}
            />
          )}
        />
        <Group justify="flex-end">
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
    </Box>
  );
}
