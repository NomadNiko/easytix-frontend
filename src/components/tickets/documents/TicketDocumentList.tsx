// src/components/tickets/documents/TicketDocumentList.tsx
import React from "react";
import { Text, Stack, Center, Loader } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import TicketDocumentItem from "./TicketDocumentItem";
import { useTicketDocumentsQuery } from "@/app/[language]/tickets/queries/ticket-documents-queries";

interface TicketDocumentListProps {
  ticketId: string;
}

export default function TicketDocumentList({
  ticketId,
}: TicketDocumentListProps) {
  const { t } = useTranslation("tickets");
  const {
    data: documents,
    isLoading,
    isError,
  } = useTicketDocumentsQuery(ticketId);

  if (isLoading) {
    return (
      <Center p="md">
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Text color="red" size="sm">
        {t("tickets:documents.errors.loading")}
      </Text>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Text color="dimmed" size="sm">
        {t("tickets:documents.empty")}
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {documents.map((document) => (
        <TicketDocumentItem key={document.id} document={document} />
      ))}
    </Stack>
  );
}
