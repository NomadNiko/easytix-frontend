// src/components/tickets/documents/TicketDocumentItem.tsx
import React from "react";
import { Group, Card, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconDownload, IconTrash, IconFile } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import {
  TicketDocument,
  getTicketDocumentDownloadUrl,
} from "@/services/api/services/ticket-documents";
import { useDeleteTicketDocumentMutation } from "@/app/[language]/tickets/queries/ticket-documents-queries";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { formatDate } from "@/utils/format-date";

interface TicketDocumentItemProps {
  document: TicketDocument;
}

export default function TicketDocumentItem({
  document,
}: TicketDocumentItemProps) {
  const { t } = useTranslation("tickets");
  const { confirmDialog } = useConfirmDialog();
  const deleteDocumentMutation = useDeleteTicketDocumentMutation();

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: t("tickets:documents.confirm.delete.title"),
      message: t("tickets:documents.confirm.delete.message"),
    });

    if (isConfirmed) {
      deleteDocumentMutation.mutate({
        ticketId: document.ticketId,
        documentId: document.id,
      });
    }
  };

  // Get the proper download URL for the document
  const downloadUrl = getTicketDocumentDownloadUrl(
    document.ticketId,
    document.id,
    document.file.path
  );

  return (
    <Card shadow="xs" p="md" radius="md" withBorder mb="xs">
      <Group justify="space-between">
        <Group>
          <IconFile size={24} />
          <div>
            <Text fw={500}>{document.name}</Text>
            <Text size="xs" c="dimmed">
              {formatDate(new Date(document.uploadedAt))}
            </Text>
          </div>
        </Group>

        <Group>
          <Tooltip label={t("tickets:documents.actions.download")}>
            <ActionIcon component="a" href={downloadUrl} target="_blank">
              <IconDownload size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t("tickets:documents.actions.delete")}>
            <ActionIcon
              color="red"
              onClick={handleDelete}
              loading={deleteDocumentMutation.isPending}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
}
