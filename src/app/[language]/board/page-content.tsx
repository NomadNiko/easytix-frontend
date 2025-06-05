"use client";

import { Container, Title, Box } from "@mantine/core";
import { useTranslation } from "@/services/i18n/client";
import { BoardView } from "@/components/board/BoardView";

export function PageContent() {
  const { t } = useTranslation("board");

  return (
    <Container size="xxl" px="md">
      <Box mb="lg">
        <Title order={1} mb="sm">
          {t("board:page.title")}
        </Title>
      </Box>

      <BoardView />
    </Container>
  );
}
