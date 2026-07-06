import type { Metadata } from "next";
import Link from "next/link";
import { FaHouse, FaLocationDot } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "地域が見つかりません",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-16 text-center">
      <FaLocationDot className="text-base-content/40 text-6xl" />
      <div>
        <h1 className="text-2xl font-bold">地域が見つかりません</h1>
        <p className="text-base-content/70 mt-2 text-sm">
          入力された地名が見つかりませんでした。市区町村を含めるなど、表記を変えてもう一度お試しください。
        </p>
      </div>
      <Link href="/" className="btn btn-primary gap-2">
        <FaHouse />
        トップに戻る
      </Link>
    </div>
  );
}
