// src/app/[language]/tickets/page.tsx
import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import TicketsPage from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "tickets");
  return {
    title: t("tickets.pageTitle"),
  };
}

export default function Page() {
  return <TicketsPage />;
}
