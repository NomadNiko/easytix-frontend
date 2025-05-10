// src/components/tickets/documents/TicketDocumentsSection.tsx
import React from "react";
import { Box, Group, Divider } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import TicketDocumentList from "./TicketDocumentList";
import TicketDocumentUpload from "./TicketDocumentUpload";

interface TicketDocumentsSectionProps {
  ticketId: string;
}

export default function TicketDocumentsSection({
  ticketId,
}: TicketDocumentsSectionProps) {
  const { t } = useTranslation("tickets");

  return (
    <Box>
      <Divider
        mb="md"
        label={t("tickets:tickets.fields.attachments")}
        labelPosition="left"
      />

      <Group mb="md">
        <TicketDocumentUpload ticketId={ticketId} />
      </Group>

      <Box>
        <TicketDocumentList ticketId={ticketId} />
      </Box>
    </Box>
  );
}
