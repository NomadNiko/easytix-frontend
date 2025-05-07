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
  Switch,
  Center,
  Loader,
  Paper,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslation } from "@/services/i18n/client";
import { IconSearch, IconInbox } from "@tabler/icons-react";
import {
  useNotificationsInfiniteQuery,
  useMarkAllNotificationsAsReadMutation,
  type NotificationsPage,
} from "../queries/notifications-queries";
import NotificationItem from "@/components/notifications/notification-item";
import NotificationDetailModal from "@/components/notifications/notification-detail-modal";
import RouteGuard from "@/services/auth/route-guard";
import useGlobalLoading from "@/services/loading/use-global-loading";
import { Notification } from "@/services/api/services/notifications";
import useAuth from "@/services/auth/use-auth";

function NotificationsPageContent() {
  const { t } = useTranslation("notifications");
  const { setLoading } = useGlobalLoading();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotificationsInfiniteQuery({
    limit: 10,
    search: debouncedSearch,
    isRead: showOnlyUnread ? false : undefined,
  });

  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  // Flatten all pages of notifications into a single array
  const notifications =
    infiniteData?.pages.flatMap((page: NotificationsPage) => page.data) || [];

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
  };

  const toggleUnreadFilter = () => {
    setShowOnlyUnread(!showOnlyUnread);
  };

  const handleSelectNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  // Ensure we have a user before rendering
  if (!user) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

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
                onSelect={handleSelectNotification}
                showActions={true}
              />
            ))}
            {hasNextPage && (
              <Center>
                <Button
                  onClick={() => fetchNextPage()}
                  loading={isFetchingNextPage}
                  variant="subtle"
                >
                  {t("notifications:loadMore")}
                </Button>
              </Center>
            )}
          </Stack>
        )}
      </Stack>
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
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
