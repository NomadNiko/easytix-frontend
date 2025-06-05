"use client";
import {
  Modal,
  Stack,
  Text,
  Badge,
  Group,
  Loader,
  Center,
  ScrollArea,
  Paper,
} from "@mantine/core";
import { useTicketsQuery } from "@/app/[language]/tickets/queries/ticket-queries";
import { User } from "@/services/api/types/user";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";
import { IconExternalLink } from "@tabler/icons-react";
import useLanguage from "@/services/i18n/use-language";

interface UserTicketsModalProps {
  user: User;
  opened: boolean;
  onClose: () => void;
}

export function UserTicketsModal({
  user,
  opened,
  onClose,
}: UserTicketsModalProps) {
  const { t } = useTranslation("tickets");
  const router = useRouter();
  const language = useLanguage();

  // Use React Query for optimized data fetching with caching
  const { data: ticketsResponse, isLoading: loading } = useTicketsQuery(
    {
      page: 1,
      limit: 50, // Reduced limit for better performance
      createdById: user.id,
    },
    opened // Only fetch when modal is opened
  );

  const tickets = ticketsResponse?.data || [];

  const handleTicketClick = (ticketId: string) => {
    router.push(`/${language}/tickets/${ticketId}`);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "opened":
        return "green";
      case "closed":
        return "red";
      default:
        return "gray";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={500}>
          Tickets for {user.firstName} {user.lastName}
        </Text>
      }
      size="lg"
    >
      <Stack gap="md">
        {loading ? (
          <Center py="xl">
            <Loader size="md" />
          </Center>
        ) : tickets.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            No tickets found for this user.
          </Text>
        ) : (
          <ScrollArea style={{ height: 400 }}>
            <Stack gap="sm">
              {tickets.map((ticket) => (
                <Paper
                  key={ticket.id}
                  p="md"
                  withBorder
                  style={{ cursor: "pointer" }}
                  onClick={() => handleTicketClick(ticket.id)}
                >
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      {ticket.title}
                    </Text>
                    <IconExternalLink size={16} />
                  </Group>

                  <Group gap="xs" mb="xs">
                    <Badge size="sm" color={getStatusColor(ticket.status)}>
                      {t(`tickets:tickets.statuses.${ticket.status}`)}
                    </Badge>
                    <Badge size="sm" color={getPriorityColor(ticket.priority)}>
                      {t(`tickets:tickets.priorities.${ticket.priority}`)}
                    </Badge>
                    {ticket.queue?.name && (
                      <Badge size="sm" variant="outline">
                        {ticket.queue.name}
                      </Badge>
                    )}
                  </Group>

                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {ticket.details}
                  </Text>

                  <Text size="xs" c="dimmed" mt="xs">
                    Created: {new Date(ticket.createdAt).toLocaleDateString()}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Modal>
  );
}
