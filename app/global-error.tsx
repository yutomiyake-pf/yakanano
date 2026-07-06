"use client";

// RootLayout 自体が例外を投げたケースの最終フォールバック。
// layout.tsx が動かない状況なので <html> / <body> を自前で書く必要がある。
// スタイルも globals.css に依存できないため最小限のインラインで済ませる。

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function GlobalError({ error, unstable_retry }: Props) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
            致命的なエラーが発生しました
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#666" }}>
            アプリケーション全体で予期しない問題が発生しました。
            ページを再読み込みしても復旧しない場合はしばらく時間をおいてください。
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "0.75rem",
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#999",
              }}
            >
              digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1.25rem",
              border: "1px solid #333",
              borderRadius: "0.375rem",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            もう一度試す
          </button>
        </div>
      </body>
    </html>
  );
}
