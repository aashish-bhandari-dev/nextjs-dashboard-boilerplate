import { cookies } from 'next/headers';

function buildQueryString(query?: Record<string, string | number | boolean | undefined>) {
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
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
}

const getApiBase = () => (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function request<T>(
    method: string,
    endpoint: string,
    options: {
        query?: Record<string, string | number | boolean | undefined>;
        data?: any;
    } = {}
): Promise<T> {
    const { query, data } = options;
    const headers = await getAuthHeaders();
    const queryString = buildQueryString(query);
    const apiBase = getApiBase();

    const res = await fetch(`${apiBase}/api/v1/${endpoint}${queryString}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        cache: 'no-store',
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${method} ${endpoint} failed: ${res.status} - ${errorText}`);
    }

    return res.json();
}

const get = async <T>(endpoint: string, query?: Record<string, string | number | boolean | undefined>) => 
    request<T>('GET', endpoint, { query });

const post = async <T>(endpoint: string, data?: any) => 
    request<T>('POST', endpoint, { data });

const put = async <T>(endpoint: string, data?: any) => 
    request<T>('PUT', endpoint, { data });

const patch = async <T>(endpoint: string, data?: any) => 
    request<T>('PATCH', endpoint, { data });

const del = async <T>(endpoint: string) => 
    request<T>('DELETE', endpoint);

export const serverApi = {
    get,
    post,
    put,
    patch,
    delete: del,
};

export { get as serverGet, post as serverPost, put as serverPut, patch as serverPatch, del as serverDelete };
