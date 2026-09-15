import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { authApi } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<User>;
  quickLogin: (role: UserRole) => Promise<User>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("smartmeal_token");
      const storedUser = localStorage.getItem("smartmeal_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Default demo user: Admin
        const defaultAdmin: User = {
          id: "user-1",
          email: "admin@smartmeal.com",
          name: "Mess Administrator",
          role: "ADMIN",
        };
        const demoToken = "demo-admin-token";
        setUser(defaultAdmin);
        setToken(demoToken);
        localStorage.setItem("smartmeal_token", demoToken);
        localStorage.setItem("smartmeal_user", JSON.stringify(defaultAdmin));
      }
    } catch (e) {
      console.error("Auth init error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(identifier, pass);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("smartmeal_token", res.token);
      localStorage.setItem("smartmeal_user", JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: UserRole): Promise<User> => {
    let identifier = "admin@smartmeal.com";
    let pass = "admin123";

    if (role === "RESIDENT") {
      identifier = "rahul@pg.com";
      pass = "resident123";
    } else if (role === "STAFF") {
      identifier = "kitchen@smartmeal.com";
      pass = "staff123";
    }

    return login(identifier, pass);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("smartmeal_token");
    localStorage.removeItem("smartmeal_user");
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const fresh = { ...user, ...updated };
    setUser(fresh);
    localStorage.setItem("smartmeal_user", JSON.stringify(fresh));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
