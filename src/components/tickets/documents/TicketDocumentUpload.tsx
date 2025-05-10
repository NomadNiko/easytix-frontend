import React, { useState } from "react";
import { Button, Modal, TextInput, Group, Box, Text } from "@mantine/core";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "@/services/i18n/client";
import { IconUpload } from "@tabler/icons-react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useUploadTicketDocumentMutation } from "@/app/[language]/tickets/queries/ticket-documents-queries";

// Define a more specific type that works with Yup validation
type UploadFormData = {
  name: string;
  // Don't include file in the Yup schema validation
};

interface TicketDocumentUploadProps {
  ticketId: string;
}

export default function TicketDocumentUpload({
  ticketId,
}: TicketDocumentUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { t } = useTranslation("tickets");
  const uploadMutation = useUploadTicketDocumentMutation();

  // Fix: Only validate the name field with Yup
  const validationSchema = yup.object().shape({
    name: yup.string().required(t("tickets:documents.validation.nameRequired")),
  });

  const methods = useForm<UploadFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
    },
  });

  const { handleSubmit, reset, setValue, control } = methods;

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Auto-fill name field with filename if empty
      if (!methods.getValues("name")) {
        setValue("name", file.name);
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedFile) {
      // Handle file validation separately
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        ticketId,
        file: selectedFile,
        name: data.name,
      });

      closeModal();
    } catch (error) {
      // Error is handled by the mutation
      console.error("Upload error:", error);
    }
  });

  return (
    <>
      <Button
        onClick={openModal}
        leftSection={<IconUpload size={16} />}
        size="compact-sm"
      >
        {t("tickets:documents.actions.upload")}
      </Button>

      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        title={t("tickets:documents.upload.title")}
        centered
      >
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <Box>
              <Text fw={500} size="sm" mb="xs">
                {t("tickets:documents.upload.fileLabel")}
              </Text>

              <input
                type="file"
                onChange={handleFileChange}
                style={{
                  display: "block",
                  width: "100%",
                  marginBottom: "1rem",
                }}
              />

              {!selectedFile && (
                <Text color="red" size="sm" mb="md">
                  {t("tickets:documents.validation.fileRequired")}
                </Text>
              )}

              {selectedFile && (
                <Text size="sm" mb="md">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)}{" "}
                  KB)
                </Text>
              )}
            </Box>

            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  label={t("tickets:documents.upload.nameLabel")}
                  placeholder={t("tickets:documents.upload.namePlaceholder")}
                  error={fieldState.error?.message}
                  data-testid="document-name"
                />
              )}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={closeModal} size="compact-sm">
                {t("common:actions.cancel")}
              </Button>

              <Button
                type="submit"
                loading={uploadMutation.isPending}
                disabled={!selectedFile}
                size="compact-sm"
              >
                {t("tickets:documents.upload.submit")}
              </Button>
            </Group>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
}
