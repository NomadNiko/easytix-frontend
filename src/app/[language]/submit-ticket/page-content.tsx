"use client";

import { Container, Title, Text, Box, Stack, Anchor } from "@mantine/core";
import { PublicTicketForm } from "@/components/tickets/PublicTicketForm";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";

export default function PublicTicketPageContent() {
  const { t } = useTranslation("tickets");
  const router = useRouter();

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
