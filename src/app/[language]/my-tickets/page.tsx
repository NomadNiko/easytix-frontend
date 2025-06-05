// src/app/[language]/my-tickets/page.tsx
import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import MyTicketsPage from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "tickets");
  return {
    title: t("myTickets.pageTitle"),
  };
}

export default function Page() {
  return <MyTicketsPage />;
}
