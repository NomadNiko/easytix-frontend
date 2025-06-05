"use client";

import React from "react";
import { Tabs, Paper, Badge, Group, Text } from "@mantine/core";

interface Queue {
  id: string;
  name: string;
  description: string;
  assignedUserIds: string[];
}

interface QueueTabsProps {
  queues: Queue[];
  selectedQueueId: string | null;
  onQueueChange: (queueId: string) => void;
}

export function QueueTabs({
  queues,
  selectedQueueId,
  onQueueChange,
}: QueueTabsProps) {
  return (
    <Paper p="sm" mb="lg" withBorder>
      <Tabs
        value={selectedQueueId}
        onChange={(value) => value && onQueueChange(value)}
        variant="outline"
      >
        <Tabs.List>
          {queues.map((queue) => (
            <Tabs.Tab key={queue.id} value={queue.id}>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {queue.name}
                </Text>
                <Badge
                  size="xs"
                  variant="light"
                  color="blue"
                  title={`${queue.assignedUserIds?.length || 0} assigned users`}
                >
                  {queue.assignedUserIds?.length || 0}
                </Badge>
              </Group>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {queues.map((queue) => (
          <Tabs.Panel key={queue.id} value={queue.id} pt="sm">
            {queue.description && (
              <Text size="sm" c="dimmed" mb="sm">
                {queue.description}
              </Text>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Paper>
  );
}
