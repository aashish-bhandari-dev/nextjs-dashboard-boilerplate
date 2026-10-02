function buildQueryString(
  query?: Record<string, string | number | boolean | undefined>,
) {
  if (!query) return '';
  const queryString = new URLSearchParams(
    Object.entries(query).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();
  return queryString ? `?${queryString}` : '';
}

async function getAuthHeaders() {
  let token: string | undefined;

  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      token = cookieStore.get('access_token')?.value;
    } catch {
      // Not executed inside a Next.js server request context
    }
  } else {
    try {
      const Cookies = (await import('js-cookie')).default;
      token = Cookies.get('access_token');
    } catch {
      // In-browser fallback
    }
  }

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');

interface ApiErrorObject extends Error {
  status?: number;
  response?: {
    status: number;
    data: unknown;
  };
}

async function request<T>(
  method: string,
  endpoint: string,
  options: {
    query?: Record<string, string | number | boolean | undefined>;
    data?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const { query, data, headers: customHeaders } = options;
  const defaultHeaders = await getAuthHeaders();
  const queryString = buildQueryString(query);
  const apiBase = getApiBase();

  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const path = cleanEndpoint.startsWith('api/v1/')
    ? `/${cleanEndpoint}`
    : `/api/v1/${cleanEndpoint}`;

  const url = `${apiBase}${path}${queryString}`;

  const res = await fetch(url, {
    method,
    headers: {
      ...defaultHeaders,
      ...customHeaders,
    },
    body: data ? JSON.stringify(data) : undefined,
    cache: 'no-store',
  });

  const responseText = await res.text();
  let parsedData: unknown = null;

  try {
    parsedData = JSON.parse(responseText);
  } catch {
    // Response is not JSON
  }

  if (!res.ok) {
    const errorData = (parsedData && typeof parsedData === 'object'
      ? parsedData
      : null) as Record<string, unknown> | null;

    const nestedError = errorData?.error as Record<string, unknown> | undefined;
    const message =
      (typeof errorData?.message === 'string' && errorData.message) ||
      (typeof nestedError?.message === 'string' && nestedError.message) ||
      responseText ||
      `${method} ${endpoint} failed with status ${res.status}`;

    const error: ApiErrorObject = new Error(message);
    error.status = res.status;
    error.response = {
      status: res.status,
      data: errorData || { message: message },
    };

    throw error;
  }

  return (parsedData !== null ? parsedData : responseText) as T;
}

const get = async <T>(
  endpoint: string,
  query?: Record<string, string | number | boolean | undefined>,
) => request<T>('GET', endpoint, { query });

const post = async <T>(endpoint: string, data?: unknown) =>
  request<T>('POST', endpoint, { data });

const put = async <T>(endpoint: string, data?: unknown) =>
  request<T>('PUT', endpoint, { data });

const patch = async <T>(endpoint: string, data?: unknown) =>
  request<T>('PATCH', endpoint, { data });

const del = async <T>(endpoint: string) => request<T>('DELETE', endpoint);

export const serverApi = {
  get,
  post,
  put,
  patch,
  delete: del,
};

export {
  get as serverGet,
  post as serverPost,
  put as serverPut,
  patch as serverPatch,
  del as serverDelete,
};
