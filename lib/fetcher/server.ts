import "server-only";
import type { z } from "zod";
import { type BaseFetcherOptions, baseFetch } from "./core";

/**
 * サーバ (RSC / API Route / Server Action) から呼ぶ fetcher。
 * Next.js のサーバ fetch は絶対 URL が必須なので NEXT_PUBLIC_SITE_URL を必ず設定すること。
 */
export function serverFetcher<TSchema extends z.ZodType>(
  endpoint: string,
  options: BaseFetcherOptions<TSchema>,
): Promise<z.infer<TSchema>>;
export function serverFetcher<TSchema extends z.ZodType>(
  endpoint: string,
  options: BaseFetcherOptions<TSchema> & { throwErr: false },
): Promise<z.infer<TSchema> | null>;
export function serverFetcher<TSchema extends z.ZodType>(
  endpoint: string,
  options: BaseFetcherOptions<TSchema>,
): Promise<z.infer<TSchema> | null> {
  return baseFetch(endpoint, options);
}
