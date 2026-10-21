import type { ApiError } from '../features/auth/authTypes';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export function normalizeApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      message:
        typeof error.message === 'string'
          ? error.message
          : 'The request could not be completed.',
      code:
        'code' in error && typeof error.code === 'string'
          ? error.code
          : undefined,
      errors:
        'errors' in error && Array.isArray(error.errors)
          ? error.errors.filter(
              (detail): detail is { field: string; message: string } =>
                typeof detail === 'object' &&
                detail !== null &&
                'field' in detail &&
                typeof detail.field === 'string' &&
                'message' in detail &&
                typeof detail.message === 'string',
            )
          : undefined,
    };
  }
  return { message: 'The request could not be completed.' };
}

export async function apiRequest<T>(
  path: string,
  { token, headers, ...options }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw {
      message:
        'Could not connect to PetRegister. Check that the API is running.',
    } satisfies ApiError;
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (body !== null) throw normalizeApiError(body);
    throw {
      message: 'The server returned an unreadable response.',
    } satisfies ApiError;
  }
  return body as T;
}
