// src/app/[language]/profile/notifications/page-content.tsx
"use client";
import {
  Container,
  Title,
  Stack,
  Group,
  Button,
  TextInput,
  Text,
  Divider,
  Pagination,
  Switch,
  Center,
  Loader,
  Paper,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslation } from "@/services/i18n/client";
import { IconSearch, IconInbox } from "@tabler/icons-react";
import {
  useNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
} from "../queries/notifications-queries";
import NotificationItem from "@/components/notifications/notification-item";
import RouteGuard from "@/services/auth/route-guard";
import useGlobalLoading from "@/services/loading/use-global-loading";

function NotificationsPageContent() {
  const { t } = useTranslation("notifications");
  const { setLoading } = useGlobalLoading();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const { data: notifications = [], isLoading } = useNotificationsQuery({
    page,
    limit,
    search: debouncedSearch,
    isRead: showOnlyUnread ? false : undefined,
  });

  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  // Handle debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Set global loading state
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page on search
  };

  const toggleUnreadFilter = () => {
    setShowOnlyUnread(!showOnlyUnread);
    setPage(1); // Reset to first page on filter change
  };

  return (
    <Container size="md">
      <Stack gap="md" py="lg">
        <Group justify="space-between" wrap="nowrap">
          <Title order={3}>{t("notifications:title")}</Title>
          {notifications && notifications.length > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="light"
              loading={markAllAsReadMutation.isPending}
              size="compact-sm"
            >
              {t("notifications:markAllAsRead")}
            </Button>
          )}
        </Group>

        <Group justify="space-between">
          <TextInput
            placeholder={t("notifications:search")}
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ flex: 1 }}
          />
          <Group>
            <Text size="sm">{t("notifications:showOnlyUnread")}</Text>
            <Switch checked={showOnlyUnread} onChange={toggleUnreadFilter} />
          </Group>
        </Group>

        <Divider />

        {isLoading ? (
          <Center p="xl">
            <Loader size="md" />
          </Center>
        ) : notifications.length === 0 ? (
          <Paper withBorder p="xl" radius="md">
            <Stack align="center" gap="md">
              <IconInbox size={48} color="gray" />
              <Text ta="center" color="dimmed">
                {t("notifications:empty")}
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="md">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                expanded={true}
                showActions={true}
              />
            ))}
            <Center>
              <Pagination total={10} value={page} onChange={setPage} mt="md" />
            </Center>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

function NotificationsPage() {
  return (
    <RouteGuard>
      <NotificationsPageContent />
    </RouteGuard>
  );
}

export default NotificationsPage;
