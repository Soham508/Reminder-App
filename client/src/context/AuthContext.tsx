import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    age?: number | null;
    bio?: string | null;
}

interface AuthContextType {
    access: string | null;
    refresh: string | null;
    isAuthenticated: boolean;
    user: UserInfo | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [access, setAccess] = useState<string | null>(() => localStorage.getItem("access"));
    const [refresh, setRefresh] = useState<string | null>(() => localStorage.getItem("refresh"));
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("access"));

    useEffect(() => {
        if (access && !user) {
            fetchUser();
        }
        // eslint-disable-next-line
    }, [access]);

    const login = async (username: string, password: string) => {
        const res = await axios.post("http://localhost:8000/api/login/", { username, password });
        setAccess(res.data.access);
        setRefresh(res.data.refresh);
        setIsAuthenticated(true);
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        await fetchUser(res.data.access);
    };

    const register = async (username: string, email: string, password: string) => {
        await axios.post("http://localhost:8000/api/register/", { username, email, password });
        await login(username, password);
    };

    const logout = () => {
        setAccess(null);
        setRefresh(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
    };

    const fetchUser = async (token?: string) => {
        const jwt = token || access;
        if (!jwt) return;
        try {
            const res = await axios.get("http://localhost:8000/api/profile/", {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setUser(res.data as UserInfo);
        } catch {
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                access,
                refresh,
                isAuthenticated,
                user,
                login,
                register,
                logout,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
