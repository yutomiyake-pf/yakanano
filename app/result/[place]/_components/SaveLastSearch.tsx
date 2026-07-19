"use client";

import { useEffect } from "react";
import {
  LAST_PLACE_KEY,
  LAST_SKIN_KEY,
  LAST_SPF_KEY,
} from "@/constants/storage";

interface Props {
  place: string;
  skin: number;
  spf: number;
}

// 結果ページ表示時に「前回の入力」を localStorage へ保存する (描画なし)。
// 検索フォーム経由だけでなく、ランキング直リンク・外部からの直流入も履歴に残すため。
export const SaveLastSearch = ({ place, skin, spf }: Props) => {
  useEffect(() => {
    localStorage.setItem(LAST_PLACE_KEY, place);
    localStorage.setItem(LAST_SKIN_KEY, String(skin));
    localStorage.setItem(LAST_SPF_KEY, String(spf));
  }, [place, skin, spf]);

  return null;
};
