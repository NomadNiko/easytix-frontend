// src/components/tickets/categories/CategoryForm.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextInput, Button, Group, Box } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";

interface CategoryFormProps {
  queueId: string;
  initialValues?: {
    name: string;
  };
  onSubmit: (values: { name: string }) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function CategoryForm({
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: CategoryFormProps) {
  const { t } = useTranslation("tickets");

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .required(t("tickets:categories.validation.nameRequired")),
  });

  const { control, handleSubmit } = useForm({
    defaultValues: initialValues || {
      name: "",
    },
    resolver: yupResolver(validationSchema),
  });

  const handleFormSubmit = (values: { name: string }) => {
    onSubmit(values);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label={t("tickets:categories.fields.name")}
              placeholder={t("tickets:categories.placeholders.name")}
              error={fieldState.error?.message}
              required
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
