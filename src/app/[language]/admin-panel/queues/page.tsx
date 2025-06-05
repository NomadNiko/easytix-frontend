// src/app/[language]/admin-panel/queues/page.tsx
import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import QueueManagement from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "tickets");
  return {
    title: t("admin.queueManagement"),
  };
}

export default function Page() {
  return <QueueManagement />;
}
