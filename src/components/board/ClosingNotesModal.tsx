"use client";

import React, { useState } from "react";
import { Modal, Stack, Textarea, Button, Group, Text } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";

interface ClosingNotesModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (closingNotes: string) => void;
  ticketTitle: string;
}

export function ClosingNotesModal({
  opened,
  onClose,
  onConfirm,
  ticketTitle,
}: ClosingNotesModalProps) {
  const { t } = useTranslation("board");
  const [closingNotes, setClosingNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(closingNotes);
    setClosingNotes("");
  };

  const handleCancel = () => {
    setClosingNotes("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title={t("board:modals.closingNotes.title")}
      centered
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t("board:modals.closingNotes.description")}
        </Text>

        <Text size="sm" fw={500}>
          {ticketTitle}
        </Text>

        <Textarea
          label={t("board:modals.closingNotes.label")}
          placeholder={t("board:modals.closingNotes.placeholder")}
          value={closingNotes}
          onChange={(event) => setClosingNotes(event.currentTarget.value)}
          rows={4}
          data-autofocus
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleCancel}>
            {t("common:actions.cancel")}
          </Button>
          <Button onClick={handleConfirm}>
            {t("board:modals.closingNotes.confirm")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
