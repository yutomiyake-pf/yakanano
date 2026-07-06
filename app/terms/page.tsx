import type { Metadata } from "next";
import { SITE_NAME } from "../../constants/site";
import { PageComponent } from "./_components/PageComponent";

export const metadata: Metadata = {
  title: "利用規約",
  description: `${SITE_NAME} の利用規約。判定結果の無保証・免責事項・禁止事項などの利用条件を定めています。`,
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PageComponent />;
}
