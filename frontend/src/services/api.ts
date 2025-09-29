import axios, {
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from "axios";

const API_URL = "http://localhost:5000/api";

// Configurar interceptor para incluir token en todas las peticiones
axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autorización
axios.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
        });
        return response.data;
    },

    register: async (
        email: string,
        password: string
    ): Promise<AuthResponse> => {
        const response = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
        });
        return response.data;
    },

    getProfile: async (): Promise<{ user: User }> => {
        const response = await axios.get(`${API_URL}/auth/profile`);
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem("token");
    },
};

// Types
interface User {
    id: number;
    email: string;
    is_active: boolean;
}

interface AuthResponse {
    access_token: string;
    user: User;
}

interface UpdateUserData {
    email?: string;
    password?: string;
    is_active?: boolean;
}

export const userService = {
    getUsers: async (): Promise<{ users: User[] }> => {
        const response = await axios.get(`${API_URL}/users/`);
        return response.data;
    },

    getUser: async (id: number): Promise<{ user: User }> => {
        const response = await axios.get(`${API_URL}/users/${id}`);
        return response.data;
    },

    updateUser: async (
        id: number,
        data: UpdateUserData
    ): Promise<{ user: User }> => {
        const response = await axios.put(`${API_URL}/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number): Promise<{ msg: string }> => {
        const response = await axios.delete(`${API_URL}/users/${id}`);
        return response.data;
    },
};

// Export types for use in components
export type { User, AuthResponse, UpdateUserData };
