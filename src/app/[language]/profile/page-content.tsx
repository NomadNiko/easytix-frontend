"use client";
import useAuth from "@/services/auth/use-auth";
import { Container, Group, Stack, Box, Title, Avatar } from "@mantine/core";
import { Button } from "@mantine/core";
import Link from "@/components/link";
import { useTranslation } from "@/services/i18n/client";
import RouteGuard from "@/services/auth/route-guard";
import { useEffect } from "react";
import useGlobalLoading from "@/services/loading/use-global-loading";
import UserDocumentsSection from "@/components/user-documents/UserDocumentsSection";

function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation("profile");
  const { setLoading } = useGlobalLoading();

  // Turn off loading indicator when component mounts
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <Container size="sm">
      <Group gap="md" py="md" align="flex-start">
        <Avatar
          size={160}
          radius="xl"
          alt={user?.firstName + " " + user?.lastName}
          data-testid="user-icon"
          src={user?.photo?.path}
        />
        <Stack gap="xs">
          <Title order={3} mb="md" data-testid="user-name">
            {user?.firstName} {user?.lastName}
          </Title>
          <Title order={5} mb="md" data-testid="user-email">
            {user?.email}
          </Title>
          {user?.phoneNumber && (
            <Title order={5} mb="md" data-testid="user-phone">
              {user?.phoneNumber}
            </Title>
          )}
          <Box>
            <Group gap="xs">
              <Button
                component={Link}
                href="/profile/edit"
                data-testid="edit-profile"
                size="compact-sm"
              >
                {t("profile:actions.edit")}
              </Button>
              <Button
                component={Link}
                href="/profile/notification-settings"
                data-testid="notification-settings"
                size="compact-sm"
                variant="light"
              >
                {t("profile:actions.notificationSettings")}
              </Button>
            </Group>
          </Box>
        </Stack>
      </Group>

      {/* Add the User Documents Section */}
      <UserDocumentsSection />
    </Container>
  );
}

function ProfilePage() {
  return (
    <RouteGuard>
      <Profile />
    </RouteGuard>
  );
}

export default ProfilePage;
