import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import SystemDefaultsPageContent from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(language, "admin-panel-home");

  return {
    title: t("System Defaults"),
  };
}

export default function SystemDefaultsPage() {
  return <SystemDefaultsPageContent />;
}
