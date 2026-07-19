// インストール可能条件を満たすための最小 Service Worker。
// オフラインキャッシュは行わない (fetch ハンドラ無し)。
// 将来オフライン対応する場合はここに fetch ハンドラ＋キャッシュ戦略を追加する。
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
