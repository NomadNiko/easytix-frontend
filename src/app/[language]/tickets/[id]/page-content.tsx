// src/app/[language]/tickets/[id]/page-content.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Container, Paper, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import {
  useTicketQuery,
  useAssignTicketMutation,
  useUpdateTicketStatusMutation,
  TicketStatus,
} from "@/app/[language]/tickets/queries/ticket-queries";
import {
  useHistoryItemsByTicketQuery,
  useCreateCommentMutation,
} from "@/app/[language]/tickets/queries/history-item-queries";
import { TicketDetails } from "@/components/tickets/TicketDetails";
import { useGetUsersService } from "@/services/api/services/users";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetCategoriesByQueueService } from "@/services/api/services/categories";

interface UserInfo {
  id: string;
  name: string;
}
interface CategoryInfo {
  id: string;
  name: string;
}
interface DocumentInfo {
  id: string;
  name: string;
  url: string;
}

function TicketPage() {
  // Get the ID from URL parameters
  const params = useParams();
  const id = params.id as string;
  const { t } = useTranslation("tickets");
  const router = useRouter();
  const language = useLanguage();

  // Data states with proper typing
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);

  // Queries and services
  const { data: ticket, isLoading: isTicketLoading } = useTicketQuery(id);
  const { data: historyItems, isLoading: isHistoryLoading } =
    useHistoryItemsByTicketQuery(id);
  const assignTicketMutation = useAssignTicketMutation();
  const updateStatusMutation = useUpdateTicketStatusMutation();
  const createCommentMutation = useCreateCommentMutation();
  const getUsersService = useGetUsersService();
  const getCategoriesService = useGetCategoriesByQueueService();

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { status, data } = await getUsersService(undefined, {
          page: 1,
          limit: 50,
        });
        if (status === HTTP_CODES_ENUM.OK) {
          const formattedUsers = data.data.map((user) => ({
            id: user.id.toString(),
            name: `${user.firstName} ${user.lastName}`,
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [getUsersService]);

  // Load categories when ticket is loaded
  useEffect(() => {
    if (ticket?.queueId) {
      const fetchCategories = async () => {
        try {
          const { status, data } = await getCategoriesService(
            { queueId: ticket.queueId },
            undefined
          );
          if (status === HTTP_CODES_ENUM.OK) {
            const formattedCategories = data.map((category) => ({
              id: category.id,
              name: category.name,
            }));
            setCategories(formattedCategories);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };
      fetchCategories();
    }
  }, [ticket?.queueId, getCategoriesService]);

  // Load document information
  useEffect(() => {
    if (ticket?.documentIds && ticket.documentIds.length > 0) {
      // Create document info from document IDs
      const mockDocuments = ticket.documentIds.map((docId) => ({
        id: docId,
        name: `Document-${docId.substring(docId.length - 6)}`,
        url: `/api/documents/${docId}`,
      }));
      setDocuments(mockDocuments);
    } else {
      setDocuments([]);
    }
  }, [ticket?.documentIds]);

  const handleAssignTicket = (userId: string) => {
    assignTicketMutation.mutate({ id, userId });
  };

  const handleStatusChange = (status: TicketStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleAddComment = (comment: string) => {
    createCommentMutation.mutate({ ticketId: id, details: comment });
  };

  const handleEditTicket = () => {
    router.push(`/${language}/tickets/${id}/edit`);
  };

  if (isTicketLoading) {
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
      <TicketDetails
        ticket={ticket}
        historyItems={historyItems || []}
        onAddComment={handleAddComment}
        onAssign={handleAssignTicket}
        onStatusChange={handleStatusChange}
        onEditTicket={handleEditTicket}
        users={users}
        categories={categories}
        isLoading={isTicketLoading || isHistoryLoading}
        documents={documents}
      />
    </Container>
  );
}

export default TicketPage;
