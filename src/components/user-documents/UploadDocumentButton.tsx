// src/components/user-documents/UploadDocumentButton.tsx
import { useState, useEffect } from "react";
import { Button, Modal, TextInput, Group } from "@mantine/core";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "@/services/i18n/client";
import { IconUpload } from "@tabler/icons-react";
import { useCreateUserDocumentMutation } from "@/app/[language]/profile/queries/user-documents-queries";
import FormFilePicker from "@/components/form/file-picker/file-picker";
import { FileEntity } from "@/services/api/types/file-entity";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

type UploadFormData = {
  file: FileEntity;
  name: string;
};

export default function UploadDocumentButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation("profile");
  const uploadMutation = useCreateUserDocumentMutation();

  const validationSchema = yup.object().shape({
    file: yup
      .object()
      .shape({
        id: yup.string().required(),
        path: yup.string().required(),
      })
      .required(t("profile:documents.validation.fileRequired")),
    name: yup.string().required(t("profile:documents.validation.nameRequired")),
  });

  const methods = useForm<UploadFormData>({
    resolver: yupResolver<UploadFormData>(validationSchema),
    defaultValues: {
      file: undefined as unknown as FileEntity,
      name: "",
    },
  });

  const { handleSubmit, reset, setValue, watch } = methods;
  const selectedFile = watch("file");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await uploadMutation.mutateAsync({
        file: data.file,
        name: data.name,
      });
      closeModal();
    } catch (error) {
      // Error is handled by the mutation
    }
  });

  // Auto-fill name when file is selected
  useEffect(() => {
    if (selectedFile && !methods.getValues("name")) {
      // Extract original filename from the path if possible
      const pathParts = selectedFile.path.split("/");
      const fileName = pathParts[pathParts.length - 1];
      setValue("name", fileName);
    }
  }, [selectedFile, setValue, methods]);

  return (
    <>
      <Button onClick={openModal} size="compact-sm">
        <Group gap={5} align="center">
          <IconUpload size={16} />
          <span>{t("profile:documents.actions.upload")}</span>
        </Group>
      </Button>

      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        title={t("profile:documents.upload.title")}
        centered
      >
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <FormFilePicker name="file" testId="document-file" />

            <Controller
              name="name"
              control={methods.control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  label={t("profile:documents.upload.nameLabel")}
                  placeholder={t("profile:documents.upload.namePlaceholder")}
                  error={fieldState.error?.message}
                  mt="md"
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
                size="compact-sm"
              >
                {t("profile:documents.upload.submit")}
              </Button>
            </Group>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
}
