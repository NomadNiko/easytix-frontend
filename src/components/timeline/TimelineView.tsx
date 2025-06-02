"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Box,
  LoadingOverlay,
  Text,
  Center,
  Paper,
  Loader,
} from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { useGetQueuesService } from "@/services/api/services/queues";
import { QueueTabs } from "./QueueTabs";
import { TimelineGrid } from "./TimelineGrid";
import { TimelineMobile } from "./TimelineMobile";
import { ResponsiveDisplay } from "@/components/responsive-display/ResponsiveDisplay";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

// Dynamic import for modal to prevent flashing
const TicketActionModal = lazy(() =>
  import("./TicketActionModal").then((module) => ({
    default: module.TicketActionModal,
  }))
);

interface Queue {
  id: string;
  name: string;
  description: string;
  assignedUserIds: string[];
}

interface SelectedTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  queueId: string;
  categoryId: string;
  createdAt: string;
  closedAt: string | null;
}

export function TimelineView() {
  const { t } = useTranslation("timeline");
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [isLoadingQueues, setIsLoadingQueues] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SelectedTicket | null>(
    null
  );
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const getQueuesService = useGetQueuesService();

  // Load queues on component mount
  useEffect(() => {
    const fetchQueues = async () => {
      setIsLoadingQueues(true);
      try {
        const { status, data } = await getQueuesService(undefined, {
          page: 1,
          limit: 100,
        });

        if (status === HTTP_CODES_ENUM.OK) {
          // Handle both response formats: direct array or {data: [], hasNextPage: boolean}
          const queuesArray = Array.isArray(data) ? data : data.data || [];
          setQueues(queuesArray);

          // Auto-select first queue if available
          if (queuesArray.length > 0) {
            setSelectedQueueId(queuesArray[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching queues:", error);
        setQueues([]);
      } finally {
        setIsLoadingQueues(false);
      }
    };

    fetchQueues();
  }, [getQueuesService]);

  const handleQueueChange = (queueId: string) => {
    setSelectedQueueId(queueId);
  };

  const handleTicketClick = (ticket: SelectedTicket) => {
    setSelectedTicket(ticket);
    setIsActionModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setIsActionModalOpen(false);
  };

  if (isLoadingQueues) {
    return (
      <Paper p="xl" withBorder>
        <LoadingOverlay visible />
        <Center h={400}>
          <Text>{t("timeline:loading.queues")}</Text>
        </Center>
      </Paper>
    );
  }

  if (queues.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center h={400}>
          <Text c="dimmed">{t("timeline:empty.noQueues")}</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Box>
      <QueueTabs
        queues={queues}
        selectedQueueId={selectedQueueId}
        onQueueChange={handleQueueChange}
      />

      {selectedQueueId && (
        <ResponsiveDisplay
          desktopContent={
            <TimelineGrid
              queueId={selectedQueueId}
              onTicketClick={handleTicketClick}
            />
          }
          mobileContent={
            <TimelineMobile
              queueId={selectedQueueId}
              onTicketClick={handleTicketClick}
            />
          }
        />
      )}

      {selectedTicket && isActionModalOpen && (
        <Suspense fallback={<Loader size="sm" />}>
          <TicketActionModal
            ticket={selectedTicket}
            opened={isActionModalOpen}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
    </Box>
  );
}
