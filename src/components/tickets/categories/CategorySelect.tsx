// src/components/tickets/categories/CategorySelect.tsx
import React, { useState, useEffect } from "react";
import { Select } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { useCategoriesByQueueQuery } from "@/app/[language]/tickets/queries/category-queries";

interface CategorySelectProps {
  queueId: string | null;
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CategorySelect({
  queueId,
  value,
  onChange,
  label,
  placeholder,
  error,
  required = false,
  disabled = false,
}: CategorySelectProps) {
  const { t } = useTranslation("tickets");
  const { data: categories, isLoading } = useCategoriesByQueueQuery(
    queueId || "",
    !!queueId
  );
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  useEffect(() => {
    if (categories) {
      const categoryOptions = categories.map((category) => ({
        value: category.id,
        label: category.name,
      }));
      setOptions(categoryOptions);
    } else {
      setOptions([]);
    }

    // If the selected category is not in the new list, clear the selection
    if (value && categories && !categories.some((c) => c.id === value)) {
      onChange(null);
    }
  }, [categories, value, onChange]);

  return (
    <Select
      label={label || t("tickets:categories.fields.category")}
      placeholder={
        placeholder || t("tickets:categories.placeholders.selectCategory")
      }
      data={options}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      disabled={disabled || isLoading || !queueId}
      searchable
      nothingFoundMessage={t("tickets:categories.nothingFound")}
    />
  );
}
