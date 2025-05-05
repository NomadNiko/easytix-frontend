// src/components/user-documents/UserDocumentsSection.tsx
import { Box, Group, Paper, Title } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import UserDocumentsList from "./UserDocumentsList";
import UploadDocumentButton from "./UploadDocumentButton";

export default function UserDocumentsSection() {
  const { t } = useTranslation("profile");

  return (
    <Paper withBorder p="md" radius="md" mt="xl">
      <Group justify="space-between" mb="md">
        <Title order={4}>{t("profile:documents.title")}</Title>
        <UploadDocumentButton />
      </Group>
      <Box>
        <UserDocumentsList />
      </Box>
    </Paper>
  );
}
