import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";
import PageContent from "./page-content";

type PublicTicketProps = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({
  params,
}: PublicTicketProps): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(language, "tickets");

  return {
    title: t("publicForm.pageTitle"),
  };
}

export default async function PublicTicketPage() {
  return <PageContent />;
}
