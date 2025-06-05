// src/app/[language]/profile/notifications/page.tsx
import type { Metadata } from "next";
import NotificationsPage from "./page-content";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "notifications");
  return {
    title: t("title"),
  };
}

export default function Page() {
  return <NotificationsPage />;
}
