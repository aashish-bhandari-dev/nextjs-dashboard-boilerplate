import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const baseURL = 
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '') + 
    '/api/v1';

const api: AxiosInstance = axios.create({
    baseURL,
    timeout: 50000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                const cookieConfig = {
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax' as const,
                };

                Cookies.remove('access_token', cookieConfig);

                if (window.location.pathname !== '/login') {
                    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    },
);

// Cache store for GET requests to prevent redundant API spam and avoid hitting rate limits
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const getCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export interface CustomRequestConfig extends AxiosRequestConfig {
    cacheTtlMs?: number; // Duration to keep in cache (e.g. 30000 for 30s)
    bypassCache?: boolean;
}

const get = async <T = unknown>(url: string, config?: CustomRequestConfig): Promise<T> => {
    const ttl = config?.cacheTtlMs ?? 0;
    const bypassCache = config?.bypassCache ?? false;
    const cacheKey = `${url}?${JSON.stringify(config?.params || {})}`;

    // Return cached response if valid
    if (!bypassCache && ttl > 0) {
        const cached = getCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data as T;
        }
    }

    // Deduplicate identical simultaneous in-flight GET requests
    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey) as Promise<T>;
    }

    const requestPromise = (async () => {
        try {
            const response: AxiosResponse<T> = await api.get(url, config);
            if (ttl > 0) {
                getCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
            }
            return response.data;
        } finally {
            inFlightRequests.delete(cacheKey);
        }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
};

// Invalidate cache by URL prefix or completely
export const clearClientApiCache = (urlPrefix?: string) => {
    if (!urlPrefix) {
        getCache.clear();
        return;
    }
    for (const key of getCache.keys()) {
        if (key.startsWith(urlPrefix)) {
            getCache.delete(key);
        }
    }
};

const post = async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    clearClientApiCache(url.split('/')[1] ? `/${url.split('/')[1]}` : undefined);
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
};

const put = async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    clearClientApiCache(url.split('/')[1] ? `/${url.split('/')[1]}` : undefined);
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
};

const patch = async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    clearClientApiCache(url.split('/')[1] ? `/${url.split('/')[1]}` : undefined);
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
};

const del = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    clearClientApiCache(url.split('/')[1] ? `/${url.split('/')[1]}` : undefined);
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
};

export const clientApi = {
    get,
    post,
    put,
    patch,
    delete: del,
    clearCache: clearClientApiCache,
};

export default api;

