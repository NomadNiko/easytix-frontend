// src/components/user-documents/UserDocumentsList.tsx
import {
  Box,
  Text,
  Stack,
  Group,
  Card,
  ActionIcon,
  Loader,
  Center,
} from "@mantine/core";
import { IconDownload, IconTrash, IconFile } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { UserDocument } from "@/services/api/services/user-documents";
import {
  useUserDocumentsQuery,
  useDeleteUserDocumentMutation,
} from "@/app/[language]/profile/queries/user-documents-queries";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { formatDate } from "@/utils/format-date";

export function UserDocumentItem({ document }: { document: UserDocument }) {
  const { t } = useTranslation("profile");
  const { confirmDialog } = useConfirmDialog();
  const deleteDocumentMutation = useDeleteUserDocumentMutation();

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: t("profile:documents.confirm.delete.title"),
      message: t("profile:documents.confirm.delete.message"),
    });
    if (isConfirmed) {
      deleteDocumentMutation.mutate({ id: document.id });
    }
  };

  // Use direct S3 URL format - the path property already contains the S3 key
  const BUCKET_NAME = "ixplor-bucket-test-01";
  const REGION = "us-east-2";
  const s3Url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${document.file.path}`;

  return (
    <Card shadow="xs" p="md" radius="md" withBorder mb="xs">
      <Group justify="space-between">
        <Group>
          <IconFile size={24} />
          <Box>
            <Text fw={500}>{document.name}</Text>
            <Text size="xs" c="dimmed">
              {formatDate(new Date(document.uploadedAt))}
            </Text>
          </Box>
        </Group>
        <Group>
          <ActionIcon
            component="a"
            href={s3Url}
            target="_blank"
            title={t("profile:documents.actions.download")}
          >
            <IconDownload size={18} />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={handleDelete}
            title={t("profile:documents.actions.delete")}
            loading={deleteDocumentMutation.isPending}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}

export default function UserDocumentsList() {
  const { t } = useTranslation("profile");
  const { data: documents, isLoading, isError } = useUserDocumentsQuery();

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Text color="red" ta="center" p="md">
        {t("profile:documents.errors.loading")}
      </Text>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Text color="dimmed" ta="center" p="md">
        {t("profile:documents.empty")}
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {documents.map((document) => (
        <UserDocumentItem key={document.id} document={document} />
      ))}
    </Stack>
  );
}
