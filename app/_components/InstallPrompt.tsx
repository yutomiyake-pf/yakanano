"use client";

import { useEffect, useState } from "react";
import { FaSquarePlus, FaXmark } from "react-icons/fa6";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "yakanano:installDismissed";

export const InstallPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // iOS Safari は beforeinstallprompt が発火しないので手順を案内する。
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      const id = requestAnimationFrame(() => setIosHint(true));
      return () => cancelAnimationFrame(id);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDeferred(null);
    setIosHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!deferred && !iosHint) return null;

  return (
    <div className="card bg-base-100/90 border-base-300 border shadow-sm">
      <div className="card-body flex-row items-center gap-3 py-3">
        <FaSquarePlus className="text-primary shrink-0 text-2xl" />
        <div className="flex-1 text-sm">
          {deferred ? (
            "アプリとしてホーム画面に追加できます。"
          ) : (
            <>
              共有ボタン →{" "}
              <span className="font-bold">「ホーム画面に追加」</span>
              でインストールできます。
            </>
          )}
        </div>
        {deferred && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={install}
          >
            追加
          </button>
        )}
        <button
          type="button"
          aria-label="閉じる"
          className="btn btn-ghost btn-sm btn-circle"
          onClick={dismiss}
        >
          <FaXmark />
        </button>
      </div>
    </div>
  );
};
