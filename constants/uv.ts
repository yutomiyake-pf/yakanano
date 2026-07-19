// フォーム選択肢と入力バリデーション。client / server の双方から参照するため
// server-only にしない (計算ロジック本体は lib/uv.ts が server-only で持つ)。

export const SKIN_TYPES = [
  { value: 1, short: "超白肌", label: "タイプ1 — 超白肌（すぐ赤くなり黒くならない）" },
  { value: 2, short: "白肌", label: "タイプ2 — 白肌（赤くなりやすい）" },
  { value: 3, short: "普通肌", label: "タイプ3 — 普通（標準的な日本人の肌）" },
  { value: 4, short: "やや濃い肌", label: "タイプ4 — やや濃い（赤くなりにくい）" },
  { value: 5, short: "濃い肌", label: "タイプ5 — 濃い（ほとんど赤くならない）" },
  { value: 6, short: "非常に濃い肌", label: "タイプ6 — 非常に濃い（赤くならない）" },
] as const;

export const SPF_OPTIONS = [
  { value: 1, label: "使わない" },
  { value: 15, label: "SPF15" },
  { value: 30, label: "SPF30" },
  { value: 50, label: "SPF50" },
] as const;

export const DEFAULT_SKIN = 3;
export const DEFAULT_SPF = 30;

export const VALID_SKINS = SKIN_TYPES.map((t) => t.value) as number[];
export const VALID_SPFS = SPF_OPTIONS.map((o) => o.value) as number[];

// 不正・欠損時は必ずデフォルト値へ丸める。
export const clampSkin = (raw?: string | null): number => {
  const n = Number(raw);
  return VALID_SKINS.includes(n) ? n : DEFAULT_SKIN;
};

export const parseSpf = (raw?: string | null): number => {
  const n = Number(raw);
  return VALID_SPFS.includes(n) ? n : DEFAULT_SPF;
};
