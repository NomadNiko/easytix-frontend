"use client";

import { Container, Title, Text, Box, Stack, Anchor } from "@mantine/core";
import { PublicTicketForm } from "@/components/tickets/PublicTicketForm";
import { AuthenticatedTicketForm } from "@/components/tickets/AuthenticatedTicketForm";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";

export default function SubmitTicketPageContent() {
  const { t } = useTranslation("tickets");
  const router = useRouter();
  const { user, isLoaded } = useAuth();

  // Show loading while auth is being determined
  if (!isLoaded) {
    return (
      <Container size="lg" py="xl">
        Loading...
      </Container>
    );
  }

  // Authenticated users get the regular ticket form
  if (user) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="lg">
          <Box ta="center">
            <Title order={1} mb="sm">
              {t("tickets:form.createTicket")}
            </Title>
            <Text size="lg" color="dimmed">
              {t("tickets:form.createTicketDescription")}
            </Text>
          </Box>

          <AuthenticatedTicketForm />
        </Stack>
      </Container>
    );
  }

  // Guest users get the public ticket form
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Box ta="center">
          <Title order={1} mb="sm">
            {t("tickets:publicForm.pageTitle")}
          </Title>
          <Text size="lg" color="dimmed">
            {t("tickets:publicForm.pageDescription")}
          </Text>
          <Text size="sm" mt="xs">
            {t("tickets:publicForm.existingUser")}{" "}
            <Anchor
              component="button"
              fw={500}
              onClick={() => router.push("/sign-in")}
            >
              {t("tickets:publicForm.signIn")}
            </Anchor>
          </Text>
        </Box>

        <PublicTicketForm />
      </Stack>
    </Container>
  );
}
