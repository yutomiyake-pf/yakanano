"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSun } from "react-icons/fa6";
import { z } from "zod";
import {
  LAST_PLACE_KEY,
  LAST_SKIN_KEY,
  LAST_SPF_KEY,
} from "@/constants/storage";
import {
  SKIN_TYPES,
  SPF_OPTIONS,
  VALID_SKINS,
  VALID_SPFS,
} from "@/constants/uv";

const schema = z.object({
  place: z.string().trim().min(1, "地名を入力してください"),
  skin: z.number().int().min(1).max(6),
  spf: z.number().int(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  defaultPlace?: string;
  defaultSkin?: number;
  defaultSpf?: number;
}

export const SearchForm = ({
  defaultPlace = "",
  defaultSkin = 3,
  defaultSpf = 30,
}: Props) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { place: defaultPlace, skin: defaultSkin, spf: defaultSpf },
  });

  // SSR とのハイドレーション不整合を避けるため、初期値は空のままマウント後に復元する。
  // page 側で地名が指定されている場合 (defaultPlace) はそちらを優先。
  useEffect(() => {
    if (defaultPlace) return;
    const savedPlace = localStorage.getItem(LAST_PLACE_KEY);
    if (savedPlace) setValue("place", savedPlace);

    const savedSkin = Number(localStorage.getItem(LAST_SKIN_KEY));
    if (VALID_SKINS.includes(savedSkin)) setValue("skin", savedSkin);

    const savedSpf = Number(localStorage.getItem(LAST_SPF_KEY));
    if (VALID_SPFS.includes(savedSpf)) setValue("spf", savedSpf);
  }, [defaultPlace, setValue]);

  // 保存は結果ページの SaveLastSearch に集約 (直流入も履歴に残すため)。ここでは遷移のみ。
  const onSubmit = handleSubmit(({ place, skin, spf }) => {
    router.push(
      `/result/${encodeURIComponent(place)}?skin=${skin}&spf=${spf}`,
    );
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="place">
          地名
        </label>
        <input
          {...register("place")}
          id="place"
          type="text"
          placeholder="例: 東京都渋谷区、大阪 梅田"
          className="input input-bordered w-full"
          aria-label="地名"
        />
        {errors.place && (
          <p className="text-error mt-1 text-sm">{errors.place.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="skin">
          肌タイプ
        </label>
        <select
          {...register("skin", { valueAsNumber: true })}
          id="skin"
          className="select select-bordered w-full"
          aria-label="肌タイプ"
        >
          {SKIN_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="spf">
          使用する日焼け止め
        </label>
        <select
          {...register("spf", { valueAsNumber: true })}
          id="spf"
          className="select select-bordered w-full"
          aria-label="日焼け止めのSPF"
        >
          {SPF_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-primary gap-2"
        disabled={isSubmitting}
      >
        <FaSun />
        日焼けリスクを判定する
      </button>
    </form>
  );
};
