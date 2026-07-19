"use client";

import { useEffect } from "react";

// 本番のみ SW を登録する (dev の HMR とキャッシュ衝突を避ける)。
export const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
};
