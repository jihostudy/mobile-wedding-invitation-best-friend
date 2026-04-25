import type { ApiErrorResponse } from '@/types';

const isDev = process.env.NODE_ENV === 'development';

type ApiFetchInit = RequestInit & {
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  const { timeoutMs = 15000, ...fetchInit } = init ?? {};
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const headers = new Headers(init?.headers ?? {});
  const method = init?.method ?? 'GET';
  const controller = new AbortController();
  const timeoutId =
    timeoutMs > 0
      ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

  if (init?.signal) {
    if (init.signal.aborted) {
      controller.abort();
    } else {
      init.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (isDev) {
    console.log(`[apiFetch] ${method} ${path} request started`);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...fetchInit,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, '요청 시간이 초과되었습니다.', 'REQUEST_TIMEOUT');
    }
    throw error;
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
  }

  if (!response.ok) {
    let payload: ApiErrorResponse | null = null;
    try {
      payload = (await response.json()) as ApiErrorResponse;
    } catch {
      payload = null;
    }

    if (isDev) {
      console.error(`[apiFetch] ${method} ${path} failed`, {
        status: response.status,
        code: payload?.code,
        message: payload?.message,
        details: payload?.details,
      });
    }

    throw new ApiError(
      response.status,
      payload?.message || '요청 처리 중 오류가 발생했습니다.',
      payload?.code,
      payload?.details,
    );
  }

  if (isDev) {
    console.log(`[apiFetch] ${method} ${path} request succeeded`, {
      status: response.status,
    });
  }

  return (await response.json()) as T;
}
