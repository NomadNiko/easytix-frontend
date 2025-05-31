"use client";
import { useTranslation } from "@/services/i18n/client";
import {
  Container,
  Anchor,
  Flex,
  Box,
  Stack,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Button,
  Badge,
  ActionIcon,
  Loader,
  Center,
} from "@mantine/core";
import { Trans } from "react-i18next/TransWithoutContext";
import {
  IconTicket,
  IconUsers,
  IconSettings,
  IconBell,
  IconClipboardList,
  IconExternalLink,
  IconPlus,
} from "@tabler/icons-react";
import useAuth from "@/services/auth/use-auth";
import Link from "@/components/link";
import { RoleEnum } from "@/services/api/types/role";
// Dashboard component for logged-in users
function UserDashboard() {
  const { t } = useTranslation("home");
  const { user } = useAuth();

  const isAdmin = user?.role?.id === RoleEnum.ADMIN;

  const quickActions = [
    {
      title: t("dashboard.createTicket"),
      description: t("dashboard.createTicketDesc"),
      icon: <IconPlus size={24} />,
      href: "/submit-ticket",
      color: "blue",
    },
    {
      title: t("dashboard.viewTickets"),
      description: t("dashboard.viewTicketsDesc"),
      icon: <IconTicket size={24} />,
      href: "/tickets",
      color: "green",
    },
    {
      title: t("dashboard.notifications"),
      description: t("dashboard.notificationsDesc"),
      icon: <IconBell size={24} />,
      href: "/profile/notifications",
      color: "orange",
    },
    {
      title: t("dashboard.profile"),
      description: t("dashboard.profileDesc"),
      icon: <IconSettings size={24} />,
      href: "/profile",
      color: "gray",
    },
  ];

  const adminActions = [
    {
      title: "Users",
      description: t("dashboard.manageUsersDesc"),
      icon: <IconUsers size={24} />,
      href: "/admin-panel/users",
      color: "red",
    },
    {
      title: "Queues",
      description: t("dashboard.manageQueuesDesc"),
      icon: <IconClipboardList size={24} />,
      href: "/admin-panel/queues",
      color: "purple",
    },
    {
      title: t("dashboard.adminNotifications"),
      description: t("dashboard.adminNotificationsDesc"),
      icon: <IconBell size={24} />,
      href: "/admin-panel/notifications",
      color: "indigo",
    },
  ];

  const allActions = isAdmin
    ? [...quickActions, ...adminActions]
    : quickActions;

  return (
    <Container size="lg">
      <Stack gap="xl" pt="md">
        {/* Welcome Section */}
        <Box>
          <Group justify="space-between" align="center" mb="md">
            <div>
              <Title order={2} data-testid="dashboard-title">
                {t("dashboard.welcome", {
                  name: user?.firstName || "User",
                })}
              </Title>
              <Text c="dimmed" size="lg">
                {t("dashboard.subtitle")}
              </Text>
            </div>
            {isAdmin && (
              <Badge color="red" variant="light" size="lg">
                {t("dashboard.adminBadge")}
              </Badge>
            )}
          </Group>
        </Box>

        {/* Quick Actions Grid */}
        <Box>
          <Title order={3} mb="md">
            {t("dashboard.quickActions")}
          </Title>
          <Grid>
            {allActions.map((action, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Group justify="space-between" align="flex-start" mb="md">
                    <ActionIcon
                      variant="light"
                      color={action.color}
                      size="xl"
                      radius="md"
                    >
                      {action.icon}
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      component={Link}
                      href={action.href}
                    >
                      <IconExternalLink size={16} />
                    </ActionIcon>
                  </Group>

                  <Title order={4} mb="xs">
                    {action.title}
                  </Title>
                  <Text size="sm" c="dimmed" mb="md">
                    {action.description}
                  </Text>

                  <Button
                    component={Link}
                    href={action.href}
                    variant="light"
                    color={action.color}
                    fullWidth
                    radius="md"
                  >
                    {t("dashboard.goTo")}
                  </Button>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
}

// Guest landing page
function GuestLanding() {
  const { t } = useTranslation("home");

  return (
    <Container size="md">
      <Flex direction="column" h="90vh" justify="space-between" pt="md">
        <Stack gap="md">
          <Title order={3} data-testid="home-title" mb="md">
            {t("title")}
          </Title>
          <Text>
            <Trans i18nKey={`description`} t={t} />
          </Text>
        </Stack>
        <Box ta="center" pb="md">
          <Anchor href="/privacy-policy">Privacy Policy</Anchor>
        </Box>
      </Flex>
    </Container>
  );
}

export default function HomeMantine() {
  const { user, isLoaded } = useAuth();

  // Show loading spinner while auth is loading
  if (!isLoaded) {
    return (
      <Container size="md">
        <Center h="50vh">
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  // Show dashboard for logged-in users, landing page for guests
  return user ? <UserDashboard /> : <GuestLanding />;
}
