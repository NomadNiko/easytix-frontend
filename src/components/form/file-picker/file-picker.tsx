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
  Tooltip,
  Badge,
} from "@mantine/core";
import { Button } from "@mantine/core";
import React, { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  IconX,
  IconFile,
  IconDownload,
  IconInfoCircle,
} from "@tabler/icons-react";

// List of common file types to display to users
const COMMON_FILE_TYPES = [
  { ext: "pdf", desc: "PDF Documents" },
  { ext: "doc,docx", desc: "Word Documents" },
  { ext: "xls,xlsx", desc: "Excel Spreadsheets" },
  { ext: "ppt,pptx", desc: "PowerPoint Presentations" },
  { ext: "txt", desc: "Text Files" },
  { ext: "csv", desc: "CSV Files" },
  { ext: "zip,rar", desc: "Compressed Archives" },
  { ext: "jpg,jpeg,png", desc: "Images" },
  { ext: "mp3,wav", desc: "Audio Files" },
  { ext: "mp4,avi,mov", desc: "Video Files" },
];

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fetchFileUpload = useFileGeneralUploadService();
  const theme = useMantineTheme();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isLoading || acceptedFiles.length === 0) return;

      setUploadError(null);
      setIsLoading(true);

      try {
        const file = acceptedFiles[0];

        // Safely get file name
        const safeFileName = file?.name || "unknown-file";
        setFileName(safeFileName);

        const { status, data } = await fetchFileUpload(file);

        if (status === HTTP_CODES_ENUM.CREATED) {
          onChange(data.file);
        } else {
          console.error("File upload failed with status:", status);
          setUploadError("Upload failed. Please try again.");
        }
      } catch (error) {
        console.error("File upload failed with error:", error);
        setUploadError("An error occurred while uploading.");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFileUpload, onChange, isLoading]
  );

  // Handle rejected files (e.g., too large)
  const onDropRejected = useCallback(
    (rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length === 0) return;

      const rejection = rejectedFiles[0];
      if (rejection?.errors[0]?.code === "file-too-large") {
        setUploadError(
          `File is too large. Maximum size is ${props.maxSize ? Math.round(props.maxSize / (1024 * 1024)) : 20}MB.`
        );
      } else {
        setUploadError("File was rejected. Please try another file.");
      }
    },
    [props.maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    maxSize: props.maxSize || 20 * 1024 * 1024, // Default to 20MB if not specified
    disabled: isLoading || props.disabled,
    // Critical fix: Set to undefined to allow ALL file types
    accept: undefined,
  });

  const removeFileHandle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      onChange(null);
      setFileName(undefined);
      setUploadError(null);
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
        border: `1px dashed ${theme.other.customColors.border}`,
        borderRadius: theme.radius.sm,
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
            backgroundColor: theme.other.customColors.overlayDark,
            zIndex: theme.other.zIndex.base + 1,
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
                <IconDownload size={theme.other.iconSizesPixels.lg} />
              </ActionIcon>
              <ActionIcon color="red" onClick={removeFileHandle}>
                <IconX size={theme.other.iconSizesPixels.lg} />
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

      {/* Display any upload errors */}
      {uploadError && (
        <Text color="red" size="sm" mt="xs">
          {uploadError}
        </Text>
      )}

      {/* Added new section for file types */}
      <Box mt="md" w="100%">
        <Group align="center" mb="xs">
          <Text size="sm" fw={500}>
            Supported File Types:
          </Text>
          <Tooltip label="All file types are accepted including ZIP, RAR, DOC, PDF, etc.">
            <ActionIcon variant="transparent" size="xs">
              <IconInfoCircle size={theme.other.iconSizesPixels.md} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group gap="xs" align="center">
          {COMMON_FILE_TYPES.map((type) => (
            <Badge
              key={type.ext}
              size="sm"
              radius="sm"
              color="blue"
              variant="light"
            >
              {type.desc}
            </Badge>
          ))}
        </Group>
      </Box>

      <Text mt="xs" size="xs" color="dimmed">
        Max file size:{" "}
        {props.maxSize
          ? `${Math.round(props.maxSize / (1024 * 1024))}MB`
          : "20MB"}
      </Text>

      {props.error && !uploadError && (
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
