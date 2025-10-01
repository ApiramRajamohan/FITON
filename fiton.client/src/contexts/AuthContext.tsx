// src/contexts/AuthContext.tsx
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import api from "../utils/api";

interface AuthContextType {
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("jwt"));

    // Sync token with axios defaults
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (email: string, password: string) => {
        const res = await api.post("/auth/login", { email, password });
        if (res.data.token) {
            const newToken = res.data.token;
            setToken(newToken);
            localStorage.setItem("jwt", newToken);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        const res = await api.post("/auth/register", { username, email, password });
        if (res.data.token) {
            const newToken = res.data.token;
            setToken(newToken);
            localStorage.setItem("jwt", newToken);
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            localStorage.removeItem("jwt");
            delete api.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};