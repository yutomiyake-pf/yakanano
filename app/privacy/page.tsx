import type { Metadata } from "next";
import { SITE_NAME } from "../../constants/site";
import { PageComponent } from "./_components/PageComponent";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${SITE_NAME} のプライバシーポリシー。本サービスにおける個人情報・アクセスログの取扱いについて定めています。`,
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PageComponent />;
}
