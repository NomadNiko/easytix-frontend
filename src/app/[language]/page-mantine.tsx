"use client";
import { useTranslation } from "@/services/i18n/client";
import {
  Container,
  Anchor,
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
import {
  IconTicket,
  IconUsers,
  IconSettings,
  IconBell,
  IconClipboardList,
  IconExternalLink,
  IconPlus,
  IconSearch,
  IconCalendarTime,
  IconColumns3,
  IconFileText,
  IconShield,
  IconCurrencyDollar,
  IconBuilding,
  IconDeviceMobile,
  IconWorld,
  IconHeadset,
} from "@tabler/icons-react";
import useAuth from "@/services/auth/use-auth";
import Link from "@/components/link";
import { RoleEnum } from "@/services/api/types/role";
// Dashboard component for logged-in users
function UserDashboard() {
  const { t } = useTranslation("home");
  const { user } = useAuth();

  const isAdmin = Number(user?.role?.id) === RoleEnum.ADMIN;
  const isServiceDesk = Number(user?.role?.id) === RoleEnum.SERVICE_DESK;

  const quickActions = [
    {
      title: t("dashboard.createTicket"),
      description: t("dashboard.createTicketDesc"),
      icon: <IconPlus size={24} />,
      href: "/submit-ticket",
      color: "blue",
    },
    {
      title: t("dashboard.myTickets"),
      description: t("dashboard.myTicketsDesc"),
      icon: <IconFileText size={24} />,
      href: "/my-tickets",
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

  const serviceDeskActions = [
    {
      title: t("dashboard.ticketSearch"),
      description: t("dashboard.ticketSearchDesc"),
      icon: <IconSearch size={24} />,
      href: "/tickets",
      color: "cyan",
    },
    {
      title: t("dashboard.board"),
      description: t("dashboard.boardDesc"),
      icon: <IconColumns3 size={24} />,
      href: "/board",
      color: "teal",
    },
    {
      title: t("dashboard.timeline"),
      description: t("dashboard.timelineDesc"),
      icon: <IconCalendarTime size={24} />,
      href: "/timeline",
      color: "violet",
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
    ? [...quickActions, ...serviceDeskActions, ...adminActions]
    : isServiceDesk
      ? [...quickActions, ...serviceDeskActions]
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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Hero Section */}
        <Box ta="center" py="xl">
          <Title
            order={1}
            data-testid="home-title"
            mb="md"
            c="blue"
            size="3rem"
          >
            {t("title")}
          </Title>
          <Title order={2} mb="lg" c="dimmed" fw={400} size="1.5rem">
            {t("guest.subtitle")}
          </Title>
          <Text size="lg" maw={800} mx="auto" mb="xl" c="dimmed">
            {t("guest.description")}
          </Text>

          <Group justify="center" gap="md" mb="xl">
            <Button
              component={Link}
              href="/submit-ticket"
              size="xl"
              leftSection={<IconPlus size={24} />}
              variant="filled"
              color="blue"
              radius="md"
            >
              {t("guest.submitTicket")}
            </Button>
            <Button
              component={Link}
              href="/sign-in"
              size="xl"
              variant="light"
              color="blue"
              radius="md"
            >
              {t("guest.signIn")}
            </Button>
          </Group>
        </Box>

        {/* Features Section */}
        <Box py="xl">
          <Container size="lg">
            <Title order={2} ta="center" mb="xl">
              {t("guest.features.title")}
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" radius="md" withBorder ta="center" h="100%">
                  <IconTicket size={40} color="var(--mantine-color-blue-6)" />
                  <Text fw={500} mt="md" mb="sm">
                    {t("guest.features.easy")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("guest.features.easyDesc")}
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" radius="md" withBorder ta="center" h="100%">
                  <IconBell size={40} color="var(--mantine-color-green-6)" />
                  <Text fw={500} mt="md" mb="sm">
                    {t("guest.features.tracking")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("guest.features.trackingDesc")}
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" radius="md" withBorder ta="center" h="100%">
                  <IconUsers size={40} color="var(--mantine-color-orange-6)" />
                  <Text fw={500} mt="md" mb="sm">
                    {t("guest.features.support")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("guest.features.supportDesc")}
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" radius="md" withBorder ta="center" h="100%">
                  <IconColumns3
                    size={40}
                    color="var(--mantine-color-purple-6)"
                  />
                  <Text fw={500} mt="md" mb="sm">
                    {t("guest.features.kanban")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("guest.features.kanbanDesc")}
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" radius="md" withBorder ta="center" h="100%">
                  <IconCalendarTime
                    size={40}
                    color="var(--mantine-color-cyan-6)"
                  />
                  <Text fw={500} mt="md" mb="sm">
                    {t("guest.features.timeline")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("guest.features.timelineDesc")}
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" radius="md" withBorder ta="center" h="100%">
                  <IconShield size={40} color="var(--mantine-color-red-6)" />
                  <Text fw={500} mt="md" mb="sm">
                    {t("guest.features.roles")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("guest.features.rolesDesc")}
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>
          </Container>
        </Box>

        {/* Pricing Section */}
        <Box py="xl" style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
          <Container size="lg">
            <Stack gap="xl" ta="center">
              <Box>
                <Title order={2} mb="sm">
                  {t("guest.pricing.title")}
                </Title>
                <Text size="lg" c="dimmed" mb="xl">
                  {t("guest.pricing.subtitle")}
                </Text>
              </Box>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Card
                    padding="xl"
                    radius="md"
                    withBorder
                    ta="center"
                    h="100%"
                  >
                    <IconCurrencyDollar
                      size={48}
                      color="var(--mantine-color-blue-6)"
                    />
                    <Title order={1} c="blue" mt="md" mb="xs">
                      {t("guest.pricing.perUser")}
                    </Title>
                    <Text fw={500} mb="sm">
                      {t("guest.pricing.perUserDesc")}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Simple per-user pricing
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Card
                    padding="xl"
                    radius="md"
                    withBorder
                    ta="center"
                    h="100%"
                  >
                    <IconShield
                      size={48}
                      color="var(--mantine-color-green-6)"
                    />
                    <Title order={1} c="green" mt="md" mb="xs">
                      {t("guest.pricing.maxCap")}
                    </Title>
                    <Text fw={500} mb="sm">
                      {t("guest.pricing.maxCapDesc")}
                    </Text>
                    <Text size="sm" c="dimmed">
                      No surprise billing
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Card
                    padding="xl"
                    radius="md"
                    withBorder
                    ta="center"
                    h="100%"
                  >
                    <IconBuilding
                      size={48}
                      color="var(--mantine-color-orange-6)"
                    />
                    <Title order={1} c="orange" mt="md" mb="xs">
                      {t("guest.pricing.maxUsers")}
                    </Title>
                    <Text fw={500} mb="sm">
                      {t("guest.pricing.maxUsersDesc")}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Perfect for growing teams
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>

              <Box>
                <Text size="lg" fw={500} mb="sm">
                  {t("guest.pricing.noAgentFees")}
                </Text>
                <Text size="sm" c="dimmed">
                  {t("guest.pricing.customUpgrade")}
                </Text>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Company Section */}
        <Box py="xl" style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
          <Container size="lg">
            <Stack gap="xl" ta="center">
              <Box>
                <Title order={2} mb="lg">
                  {t("guest.company.title")}
                </Title>
                <Text size="lg" maw={800} mx="auto" mb="md">
                  {t("guest.company.description")}
                </Text>
                <Anchor
                  href={t("guest.company.websiteUrl")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    backgroundColor: "var(--mantine-color-blue-1)",
                    color: "var(--mantine-color-blue-7)",
                    borderRadius: "var(--mantine-radius-md)",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "var(--mantine-font-size-lg)",
                    marginBottom: "24px",
                  }}
                >
                  <IconExternalLink size={20} />
                  {t("guest.company.website")}
                </Anchor>
              </Box>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Card
                    padding="lg"
                    radius="md"
                    withBorder
                    ta="center"
                    h="100%"
                  >
                    <IconDeviceMobile
                      size={40}
                      color="var(--mantine-color-blue-6)"
                    />
                    <Text fw={500} mt="md" mb="sm">
                      {t("guest.company.mobile")}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t("guest.company.mobileDesc")}
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Card
                    padding="lg"
                    radius="md"
                    withBorder
                    ta="center"
                    h="100%"
                  >
                    <IconWorld size={40} color="var(--mantine-color-green-6)" />
                    <Text fw={500} mt="md" mb="sm">
                      {t("guest.company.i18n")}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t("guest.company.i18nDesc")}
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Card
                    padding="lg"
                    radius="md"
                    withBorder
                    ta="center"
                    h="100%"
                  >
                    <IconHeadset
                      size={40}
                      color="var(--mantine-color-orange-6)"
                    />
                    <Text fw={500} mt="md" mb="sm">
                      {t("guest.company.support")}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t("guest.company.supportDesc")}
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Container>
        </Box>

        {/* Footer */}
        <Box ta="center" py="md">
          <Anchor href="/privacy-policy" size="sm" c="dimmed">
            Privacy Policy
          </Anchor>
        </Box>
      </Stack>
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
