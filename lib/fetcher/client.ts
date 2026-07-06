import type { z } from "zod";
import { type BaseFetcherOptions, baseFetch } from "./core";

/**
 * ブラウザから呼ぶ fetcher。
 * デフォルトでは throw、`throwErr: false` を渡すと失敗時に null を返す。
 */
export function clientFetcher<TSchema extends z.ZodType>(
  endpoint: string,
  options: BaseFetcherOptions<TSchema>,
): Promise<z.infer<TSchema>>;
export function clientFetcher<TSchema extends z.ZodType>(
  endpoint: string,
  options: BaseFetcherOptions<TSchema> & { throwErr: false },
): Promise<z.infer<TSchema> | null>;
export function clientFetcher<TSchema extends z.ZodType>(
  endpoint: string,
  options: BaseFetcherOptions<TSchema>,
): Promise<z.infer<TSchema> | null> {
  return baseFetch(endpoint, options);
}
