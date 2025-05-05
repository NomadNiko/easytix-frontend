// src/components/form/file-picker/file-picker.tsx
"use client";
import { useFileGeneralUploadService } from "@/services/api/services/files-general";
import { FileEntity } from "@/services/api/types/file-entity";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  Box,
  Text,
  Paper,
  ActionIcon,
  useMantineTheme,
  Group,
} from "@mantine/core";
import { Button } from "@mantine/core";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { IconX, IconFile, IconDownload } from "@tabler/icons-react";

type FilePickerProps = {
  error?: string;
  onChange: (value: FileEntity | null) => void;
  onBlur: () => void;
  value?: FileEntity;
  disabled?: boolean;
  testId?: string;
  label?: React.ReactNode;
  maxSize?: number;
};

function FilePicker(props: FilePickerProps) {
  const { onChange } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const fetchFileUpload = useFileGeneralUploadService();
  const theme = useMantineTheme();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isLoading) return; // Prevent multiple uploads while loading
      setIsLoading(true);
      try {
        const file = acceptedFiles[0];
        setFileName(file.name); // Store original filename for display

        // Use direct file upload, no presigned URLs
        const { status, data } = await fetchFileUpload(file);

        if (status === HTTP_CODES_ENUM.CREATED) {
          onChange(data.file);
        } else {
          console.error("File upload failed with status:", status);
        }
      } catch (error) {
        console.error("File upload failed with error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFileUpload, onChange, isLoading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: props.maxSize || 20 * 1024 * 1024, // Default to 20MB if not specified
    disabled: isLoading || props.disabled,
  });

  const removeFileHandle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      onChange(null);
      setFileName(undefined);
    },
    [onChange]
  );

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Paper
      {...getRootProps()}
      p={theme.spacing.md}
      mt={theme.spacing.md}
      withBorder
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: theme.spacing.md,
        border: "1px dashed #ddd",
        borderRadius: "8px",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {isDragActive && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text size="xl" fw="bold" color="white" ta="center">
            {t("common:formInputs.filePicker.dropzoneText") ||
              "Drop file here..."}
          </Text>
        </Box>
      )}
      {props?.value && (
        <Box
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 300,
            marginBottom: theme.spacing.md,
            padding: theme.spacing.md,
            border: `1px solid ${theme.colors.gray[3]}`,
            borderRadius: theme.radius.sm,
          }}
        >
          <Group justify="apart" align="center">
            <Group>
              <IconFile size={40} />
              <Text size="md">{fileName || "File"}</Text>
            </Group>
            <Group>
              <ActionIcon component="a" href={props.value.path} target="_blank">
                <IconDownload size={18} />
              </ActionIcon>
              <ActionIcon color="red" onClick={removeFileHandle}>
                <IconX size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </Box>
      )}
      <Box mt={props.value ? 0 : theme.spacing.md} onClick={handleButtonClick}>
        <Button
          component="label"
          loading={isLoading}
          data-testid={props.testId}
          size="compact-sm"
        >
          {isLoading
            ? t("common:loading")
            : t("common:formInputs.filePicker.selectFile") || "Select File"}
          <input {...getInputProps()} />
        </Button>
      </Box>
      <Text mt="xs" size="sm" color="dimmed">
        {t("common:formInputs.filePicker.dragAndDrop") ||
          "or drag and drop a file here"}
      </Text>
      <Text mt="xs" size="xs" color="dimmed">
        Max file size:{" "}
        {props.maxSize
          ? `${Math.round(props.maxSize / (1024 * 1024))}MB`
          : "20MB"}
      </Text>
      {props.error && (
        <Text color="red" size="sm" mt="xs">
          {props.error}
        </Text>
      )}
    </Paper>
  );
}

function FormFilePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> & {
    disabled?: boolean;
    testId?: string;
    label?: React.ReactNode;
    maxSize?: number;
  }
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <FilePicker
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
          label={props.label}
          maxSize={props.maxSize}
        />
      )}
    />
  );
}

export default FormFilePicker;
