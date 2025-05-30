import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";
import PageContent from "./page-content";

interface Props {
  params: Promise<{ language: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { t } = await getServerTranslation(resolvedParams.language, "profile");

  return {
    title: t("profile:notificationSettings.pageTitle"),
  };
}

export default function NotificationSettingsPage() {
  return <PageContent />;
}
