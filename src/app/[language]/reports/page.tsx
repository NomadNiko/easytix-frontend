import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import ReportsPageContent from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "reports");

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function ReportsPage() {
  return <ReportsPageContent />;
}
