// src/components/tickets/FilePicker.tsx
import React, { useState } from "react";
import {
  Button,
  Text,
  Group,
  Box,
  Paper,
  useMantineTheme,
} from "@mantine/core";
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { useFileGeneralUploadService } from "@/services/api/services/files-general";
import { FileEntity } from "@/services/api/types/file-entity";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

interface FilePickerProps {
  value: FileEntity | null;
  onChange: (file: FileEntity | null) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function FilePicker({
  value,
  onChange,
  label,
  disabled = false,
  error,
}: FilePickerProps) {
  const { t } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileUploadService = useFileGeneralUploadService();
  const theme = useMantineTheme();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadError(null);

    try {
      const { status, data } = await fileUploadService(file);

      if (status === HTTP_CODES_ENUM.CREATED) {
        onChange(data.file);
      } else {
        setUploadError(t("formInputs.filePicker.uploadFailed"));
      }
    } catch (error) {
      console.error("File upload error:", error);
      setUploadError(t("formInputs.filePicker.uploadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
  };

  return (
    <Box mt="md">
      {label && (
        <Text size="sm" fw={500} mb="xs">
          {label}
        </Text>
      )}

      <Paper withBorder p="md" radius="sm">
        {value ? (
          <Group justify="apart">
            <Group>
              <IconFile size={theme.other.iconSizes.xl} />
              <Text size="sm">
                {value.path.split("/").pop() ||
                  t("formInputs.filePicker.uploadedFile")}
              </Text>
            </Group>
            <Button
              variant="subtle"
              color="red"
              size="xs"
              onClick={handleRemoveFile}
              leftSection={<IconX size={theme.other.iconSizes.md} />}
              disabled={disabled}
            >
              {t("formInputs.filePicker.remove")}
            </Button>
          </Group>
        ) : (
          <Box style={{ textAlign: "center" }}>
            <Button
              component="label"
              variant="outline"
              leftSection={<IconUpload size={theme.other.iconSizes.md} />}
              loading={isLoading}
              disabled={disabled}
              size="sm"
            >
              {isLoading
                ? t("common:loading")
                : t("formInputs.filePicker.selectFile")}
              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleFileSelect}
                disabled={disabled || isLoading}
              />
            </Button>

            <Text size="xs" c="dimmed" mt="xs">
              {t("formInputs.filePicker.dragAndDrop")}
            </Text>
          </Box>
        )}
      </Paper>

      {(error || uploadError) && (
        <Text color="red" size="xs" mt="xs">
          {error || uploadError}
        </Text>
      )}
    </Box>
  );
}
