// src/app/[language]/tickets/[id]/edit/page-content.tsx
"use client";
import React from "react";
import { Container, Paper, Text } from "@mantine/core";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import {
  useTicketQuery,
  useUpdateTicketMutation,
  TicketPriority,
} from "@/app/[language]/tickets/queries/ticket-queries";
import { TicketForm } from "@/components/tickets/TicketForm";

interface TicketFormValues {
  queueId: string;
  categoryId: string;
  title: string;
  details: string;
  priority: TicketPriority;
  file?: { id: string; path: string } | null;
}

function EditTicketPage() {
  const params = useParams();
  const id = params.id as string;

  const { t } = useTranslation("tickets");
  const router = useRouter();
  const language = useLanguage();
  const { data: ticket, isLoading } = useTicketQuery(id);
  const updateTicketMutation = useUpdateTicketMutation();

  const handleUpdateTicket = (values: TicketFormValues) => {
    updateTicketMutation.mutate(
      {
        id,
        data: {
          categoryId: values.categoryId,
          title: values.title,
          details: values.details,
          priority: values.priority,
        },
      },
      {
        onSuccess: () => {
          router.push(`/${language}/tickets/${id}`);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push(`/${language}/tickets/${id}`);
  };

  if (isLoading) {
    return (
      <Container size="xl">
        <Paper withBorder p="xl">
          <Text ta="center">{t("common:loading")}</Text>
        </Paper>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container size="xl">
        <Paper withBorder p="xl">
          <Text ta="center" color="red">
            {t("tickets:tickets.notFound")}
          </Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <TicketForm
        initialValues={{
          queueId: ticket.queueId,
          categoryId: ticket.categoryId,
          title: ticket.title,
          details: ticket.details,
          priority: ticket.priority,
        }}
        onSubmit={handleUpdateTicket}
        isSubmitting={updateTicketMutation.isPending}
        onCancel={handleCancel}
      />
    </Container>
  );
}

export default EditTicketPage;
