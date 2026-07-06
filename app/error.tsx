"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FaHouse, FaRotateRight, FaTriangleExclamation } from "react-icons/fa6";

interface Props {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function Error({ error, unstable_retry }: Props) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-16 text-center">
      <FaTriangleExclamation className="text-error text-6xl" />
      <div>
        <h1 className="text-2xl font-bold">エラーが発生しました</h1>
        <p className="text-base-content/70 mt-2 text-sm">
          時間をおいて再度お試しください。問題が続く場合はページを再読み込みしてください。
        </p>
        {error.digest && (
          <p className="text-base-content/40 mt-2 font-mono text-xs">
            digest: {error.digest}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="btn btn-primary gap-2"
        >
          <FaRotateRight />
          もう一度試す
        </button>
        <Link href="/" className="btn btn-outline gap-2">
          <FaHouse />
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
