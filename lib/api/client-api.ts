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

const get = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
};

const post = async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
};

const put = async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
};

const patch = async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
};

const del = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
};

export const clientApi = {
    get,
    post,
    put,
    patch,
    delete: del,
};

export default api;
