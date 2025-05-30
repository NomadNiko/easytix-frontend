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
import { useGetTicketsService } from "@/services/api/services/tickets";
import { useState, useEffect } from "react";
import { User } from "@/services/api/types/user";
import { useRouter } from "next/navigation";
import { IconExternalLink } from "@tabler/icons-react";

interface UserTicketsModalProps {
  user: User;
  opened: boolean;
  onClose: () => void;
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  details: string;
  createdAt: string;
  queue?: {
    name: string;
  };
}

export function UserTicketsModal({
  user,
  opened,
  onClose,
}: UserTicketsModalProps) {
  // const { t } = useTranslation("admin-panel-users");
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const getTicketsService = useGetTicketsService();

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const response = await getTicketsService(undefined, {
        page: 1,
        limit: 100,
        createdById: user.id,
      });

      if (response.status === 200 && response.data) {
        setTickets(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened) {
      fetchUserTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleTicketClick = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
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
                      {ticket.status}
                    </Badge>
                    <Badge size="sm" color={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
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
