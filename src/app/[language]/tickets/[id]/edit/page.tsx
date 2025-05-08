import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import EditTicketPage from "./page-content";

type Props = {
  params: Promise<{ language: string; id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "tickets");
  return {
    title: t("tickets.editTicket"),
  };
}

export default function Page() {
  return <EditTicketPage />;
}
