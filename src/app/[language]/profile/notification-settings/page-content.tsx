"use client";
import {
  Container,
  Title,
  Stack,
  Group,
  Text,
  Paper,
  Switch,
  Divider,
  Badge,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { useEffect } from "react";
import { useTranslation } from "@/services/i18n/client";
import { IconBell, IconMail, IconInfoCircle } from "@tabler/icons-react";
import RouteGuard from "@/services/auth/route-guard";
import useGlobalLoading from "@/services/loading/use-global-loading";
import useAuth from "@/services/auth/use-auth";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "./queries/notification-preferences-queries";

interface NotificationPreference {
  email: boolean;
  notification: boolean;
}

interface NotificationPreferences {
  // Ticket Events
  ticketCreated: NotificationPreference;
  ticketAssigned: NotificationPreference;
  ticketStatusChanged: NotificationPreference;
  ticketClosed: NotificationPreference;
  ticketResolved: NotificationPreference;
  ticketReopened: NotificationPreference;
  ticketDeleted: NotificationPreference;

  // Comment Events
  newComment: NotificationPreference;

  // Document Events
  documentAdded: NotificationPreference;
  documentRemoved: NotificationPreference;

  // Change Events
  priorityChanged: NotificationPreference;
  categoryChanged: NotificationPreference;

  // Queue Events
  queueAssignment: NotificationPreference;

  // Security Events
  passwordChanged: NotificationPreference;
  emailChanged: NotificationPreference;

  // System Events
  highPriorityAlert: NotificationPreference;
  systemMaintenance: NotificationPreference;
}

interface PreferenceItemProps {
  title: string;
  description: string;
  preference: NotificationPreference | undefined;
  onToggleEmail: () => void;
  onToggleNotification: () => void;
  isSecurityEvent?: boolean;
}

function PreferenceItem({
  title,
  description,
  preference,
  onToggleEmail,
  onToggleNotification,
  isSecurityEvent = false,
}: PreferenceItemProps) {
  // Provide default values if preference is undefined
  const safePreference = preference || { email: true, notification: true };

  return (
    <Paper p="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Group gap="xs" mb="xs">
              <Text fw={500} size="sm">
                {title}
              </Text>
              {isSecurityEvent && (
                <Badge color="orange" size="xs">
                  Security
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </div>
        </Group>

        <Group gap="md" mt="sm">
          <Group gap="xs">
            <IconMail size={16} color="var(--mantine-color-blue-6)" />
            <Text size="sm">Email</Text>
            <Switch
              checked={safePreference.email}
              onChange={onToggleEmail}
              disabled={isSecurityEvent} // Security events are always enabled
              size="sm"
            />
          </Group>

          <Group gap="xs">
            <IconBell size={16} color="var(--mantine-color-green-6)" />
            <Text size="sm">In-App</Text>
            <Switch
              checked={safePreference.notification}
              onChange={onToggleNotification}
              disabled={isSecurityEvent} // Security events are always enabled
              size="sm"
            />
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}

function NotificationSettingsContent() {
  const { t } = useTranslation("profile");
  const { setLoading } = useGlobalLoading();
  const { user } = useAuth();

  const { data: preferences, isLoading } = useGetNotificationPreferencesQuery(
    user?.id
  );
  const updatePreferencesMutation = useUpdateNotificationPreferencesMutation();

  // Set global loading state
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  const handleTogglePreference = (
    key: keyof NotificationPreferences,
    type: "email" | "notification"
  ) => {
    if (!preferences) return;

    const currentPreference = preferences[key] || {
      email: true,
      notification: true,
    };
    const updatedPreference = {
      ...currentPreference,
      [type]: !currentPreference[type],
    };

    updatePreferencesMutation.mutate({
      [key]: updatedPreference,
    });
  };

  // Ensure we have a user before rendering
  if (!user) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Container size="md">
        <Center p="xl">
          <Loader size="md" />
        </Center>
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container size="md">
        <Alert
          icon={<IconInfoCircle size="1rem" />}
          color="yellow"
          title="Unable to load preferences"
        >
          We could not load your notification preferences. Please try refreshing
          the page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Stack gap="lg" py="lg">
        <div>
          <Title order={3} mb="xs">
            {t("profile:notificationSettings.title")}
          </Title>
          <Text size="sm" c="dimmed">
            {t("profile:notificationSettings.description")}
          </Text>
        </div>

        <Alert icon={<IconInfoCircle size="1rem" />} color="blue">
          {t("profile:notificationSettings.info")}
        </Alert>

        {/* Ticket Events */}
        <div>
          <Title order={4} mb="md">
            🎫 {t("profile:notificationSettings.categories.ticketEvents")}
          </Title>
          <Stack gap="md">
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.ticketCreated.title"
              )}
              description={t(
                "profile:notificationSettings.events.ticketCreated.description"
              )}
              preference={preferences.ticketCreated}
              onToggleEmail={() =>
                handleTogglePreference("ticketCreated", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("ticketCreated", "notification")
              }
            />
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.ticketAssigned.title"
              )}
              description={t(
                "profile:notificationSettings.events.ticketAssigned.description"
              )}
              preference={preferences.ticketAssigned}
              onToggleEmail={() =>
                handleTogglePreference("ticketAssigned", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("ticketAssigned", "notification")
              }
            />
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.ticketStatusChanged.title"
              )}
              description={t(
                "profile:notificationSettings.events.ticketStatusChanged.description"
              )}
              preference={preferences.ticketStatusChanged}
              onToggleEmail={() =>
                handleTogglePreference("ticketStatusChanged", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("ticketStatusChanged", "notification")
              }
            />
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.ticketClosed.title"
              )}
              description={t(
                "profile:notificationSettings.events.ticketClosed.description"
              )}
              preference={preferences.ticketClosed}
              onToggleEmail={() =>
                handleTogglePreference("ticketClosed", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("ticketClosed", "notification")
              }
            />
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.ticketResolved.title"
              )}
              description={t(
                "profile:notificationSettings.events.ticketResolved.description"
              )}
              preference={preferences.ticketResolved}
              onToggleEmail={() =>
                handleTogglePreference("ticketResolved", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("ticketResolved", "notification")
              }
            />
          </Stack>
        </div>

        <Divider />

        {/* Communication Events */}
        <div>
          <Title order={4} mb="md">
            💬 {t("profile:notificationSettings.categories.communication")}
          </Title>
          <Stack gap="md">
            <PreferenceItem
              title={t("profile:notificationSettings.events.newComment.title")}
              description={t(
                "profile:notificationSettings.events.newComment.description"
              )}
              preference={preferences.newComment}
              onToggleEmail={() =>
                handleTogglePreference("newComment", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("newComment", "notification")
              }
            />
          </Stack>
        </div>

        <Divider />

        {/* Change Events */}
        <div>
          <Title order={4} mb="md">
            🔄 {t("profile:notificationSettings.categories.changes")}
          </Title>
          <Stack gap="md">
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.priorityChanged.title"
              )}
              description={t(
                "profile:notificationSettings.events.priorityChanged.description"
              )}
              preference={preferences.priorityChanged}
              onToggleEmail={() =>
                handleTogglePreference("priorityChanged", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("priorityChanged", "notification")
              }
            />
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.categoryChanged.title"
              )}
              description={t(
                "profile:notificationSettings.events.categoryChanged.description"
              )}
              preference={preferences.categoryChanged}
              onToggleEmail={() =>
                handleTogglePreference("categoryChanged", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("categoryChanged", "notification")
              }
            />
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.documentAdded.title"
              )}
              description={t(
                "profile:notificationSettings.events.documentAdded.description"
              )}
              preference={preferences.documentAdded}
              onToggleEmail={() =>
                handleTogglePreference("documentAdded", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("documentAdded", "notification")
              }
            />
          </Stack>
        </div>

        <Divider />

        {/* Security Events */}
        <div>
          <Title order={4} mb="md">
            🔒 {t("profile:notificationSettings.categories.security")}
          </Title>
          <Stack gap="md">
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.passwordChanged.title"
              )}
              description={t(
                "profile:notificationSettings.events.passwordChanged.description"
              )}
              preference={preferences.passwordChanged}
              onToggleEmail={() => {}} // No-op for security events
              onToggleNotification={() => {}} // No-op for security events
              isSecurityEvent={true}
            />
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.emailChanged.title"
              )}
              description={t(
                "profile:notificationSettings.events.emailChanged.description"
              )}
              preference={preferences.emailChanged}
              onToggleEmail={() => {}} // No-op for security events
              onToggleNotification={() => {}} // No-op for security events
              isSecurityEvent={true}
            />
          </Stack>
        </div>

        <Divider />

        {/* System Events */}
        <div>
          <Title order={4} mb="md">
            ⚙️ {t("profile:notificationSettings.categories.system")}
          </Title>
          <Stack gap="md">
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.highPriorityAlert.title"
              )}
              description={t(
                "profile:notificationSettings.events.highPriorityAlert.description"
              )}
              preference={preferences.highPriorityAlert}
              onToggleEmail={() =>
                handleTogglePreference("highPriorityAlert", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("highPriorityAlert", "notification")
              }
            />
            <PreferenceItem
              title={t(
                "profile:notificationSettings.events.queueAssignment.title"
              )}
              description={t(
                "profile:notificationSettings.events.queueAssignment.description"
              )}
              preference={preferences.queueAssignment}
              onToggleEmail={() =>
                handleTogglePreference("queueAssignment", "email")
              }
              onToggleNotification={() =>
                handleTogglePreference("queueAssignment", "notification")
              }
            />
          </Stack>
        </div>
      </Stack>
    </Container>
  );
}

function NotificationSettingsPage() {
  return (
    <RouteGuard>
      <NotificationSettingsContent />
    </RouteGuard>
  );
}

export default NotificationSettingsPage;
