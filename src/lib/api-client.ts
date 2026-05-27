// @ts-nocheck
import { handleError } from './error-handler';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    return { data: null as T, error: handleError(error).message, status: 500 };
  }
}