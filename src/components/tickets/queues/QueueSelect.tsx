// src/components/tickets/queues/QueueSelect.tsx
import React, { useState, useEffect } from "react";
import { Select } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { useQueuesQuery } from "@/app/[language]/tickets/queries/queue-queries";

interface QueueSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function QueueSelect({
  value,
  onChange,
  label,
  placeholder,
  error,
  required = false,
  disabled = false,
}: QueueSelectProps) {
  const { t } = useTranslation("tickets");
  const { data: queuesData, isLoading } = useQueuesQuery();
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  useEffect(() => {
    if (queuesData?.data) {
      const queueOptions = queuesData.data.map((queue) => ({
        value: queue.id,
        label: queue.name,
      }));
      setOptions(queueOptions);
    }
  }, [queuesData]);

  return (
    <Select
      label={label || t("tickets:queues.fields.queue")}
      placeholder={placeholder || t("tickets:queues.placeholders.selectQueue")}
      data={options}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      disabled={disabled || isLoading}
      searchable
      nothingFoundMessage={t("tickets:queues.nothingFound")}
    />
  );
}
