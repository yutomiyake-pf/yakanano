import { z } from "zod";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface BaseFetcherOptions<TSchema extends z.ZodType> {
  /** レスポンスを検証する zod スキーマ。検証失敗で throwErr に従いエラー or null を返す */
  schema: TSchema;
  method?: Method;
  /** body は object をそのまま渡せる (内部で JSON.stringify) */
  body?: unknown;
  headers?: HeadersInit;
  /** ブラウザ / Next.js fetch のキャッシュ制御 */
  cache?: RequestCache;
  /** Next.js のリクエスト単位設定 (revalidate / tags) */
  next?: NextFetchRequestConfig;
  /** デフォルト true: 失敗時に throw。false にすると null を返してログだけ出す */
  throwErr?: boolean;
}

const buildUrl = (endpoint: string) => {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

/**
 * client / server で共有する fetch 実装。
 * 失敗時の挙動は throwErr で制御 (デフォルト: throw)。
 * 成功時は schema で zod パースしたデータを返す。
 */
export const baseFetch = async <TSchema extends z.ZodType>(
  endpoint: string,
  {
    schema,
    method = "GET",
    body,
    headers,
    cache,
    next,
    throwErr = true,
  }: BaseFetcherOptions<TSchema>,
): Promise<z.infer<TSchema> | null> => {
  const url = buildUrl(endpoint);

  const handleFailure = (message: string, cause?: unknown): null => {
    if (throwErr) {
      throw cause instanceof Error ? cause : new Error(message);
    }
    console.error(`[fetcher] ${url} → ${message}`, cause ?? "");
    return null;
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
      next,
    });
  } catch (err) {
    return handleFailure(`network_error`, err);
  }

  if (!res.ok) {
    return handleFailure(`http_${res.status}`);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch (err) {
    return handleFailure("invalid_json", err);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return handleFailure(`schema_validation_failed: ${parsed.error.message}`, parsed.error);
  }

  return parsed.data;
};
