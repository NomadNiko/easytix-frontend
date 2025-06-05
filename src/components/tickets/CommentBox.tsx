// src/components/tickets/CommentBox.tsx
import React, { useState } from "react";
import { Textarea, Button, Group } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";

interface CommentBoxProps {
  onSubmit: (comment: string) => void;
  isSubmitting?: boolean;
}

export function CommentBox({
  onSubmit,
  isSubmitting = false,
}: CommentBoxProps) {
  const { t } = useTranslation("tickets");
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment);
      setComment("");
    }
  };

  return (
    <div>
      <Textarea
        placeholder={t("tickets:tickets.commentPlaceholder")}
        value={comment}
        onChange={(event) => setComment(event.currentTarget.value)}
        minRows={3}
        mb="md"
      />
      <Group justify="flex-end">
        <Button
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
          loading={isSubmitting}
          size="compact-sm"
        >
          {t("tickets:tickets.actions.addComment")}
        </Button>
      </Group>
    </div>
  );
}
