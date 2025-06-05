"use client";

import { Container, Title, Box } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { TimelineView } from "@/components/timeline/TimelineView";

export function PageContent() {
  const { t } = useTranslation("timeline");

  return (
    <Container size="xxl" px="md">
      <Box mb="lg">
        <Title order={1} mb="sm">
          {t("timeline:page.title")}
        </Title>
      </Box>

      <TimelineView />
    </Container>
  );
}
