import { getCurrentUser, refreshToken } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  signUp: (studentId: string) => Promise<void>;
  signOut: () => Promise<void>;
  activateAccount: (password: string) => Promise<void>;
  isLoading: boolean;
  token: string | null;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    fotoUrl: string;
    token: string;
    refreshToken: string;
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    matricula: string;
    nombre: string;
    apellido: string;
    correo: string;
    token: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedRefreshToken = await AsyncStorage.getItem("refreshToken");

      if (storedToken) {
        const userData = await getCurrentUser();
        if (userData) {
          setToken(storedToken);
          setUser(userData);
        }
      } else if (storedRefreshToken) {
        // No access token but refresh token exists — try to get a new access token
        try {
          const res = await refreshToken();

          localStorage.setItem("token", res.token);
          localStorage.setItem("refreshToken", res.refreshToken);
          setToken(res.token);

          const userData = await getCurrentUser();
          if (userData) {
            setToken(storedToken);
            setUser(userData);
          }
        } catch {
          // Refresh token is invalid/expired — clear everything
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
    } catch (error) {
      console.error("Failed to load stored auth:", error);
    }
  };

    const login = async (studentId: string, password: string) => {
    setIsLoading(true);
    try {
      const body = new URLSearchParams();
      body.append(
        "datax",
        JSON.stringify({ matricula: studentId, contrasena: password }),
      );

      const response = await fetch(`${API_URL}auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      const userData: User = {
        id: data.data.id,
        name: data.data.nombre,
        lastname: data.data.apellido,
        email: data.data.correo,
        photoUrl: data.data.fotoUrl,
      };

      await AsyncStorage.setItem("token", data.data.token);
      await AsyncStorage.setItem("refreshToken", data.data.refreshToken);

      setToken(data.data.token);
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error instanceof Error ? error : new Error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (studentId: string) => {
    setIsLoading(true);

    try {
      const body = new URLSearchParams();
      body.append("datax", JSON.stringify({ matricula: studentId }));

      const response = await fetch(`${API_URL}auth/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      const userData: User = {
        id: data.data.id,
        name: data.data.nombre,
        lastname: data.data.apellido,
        email: data.data.correo,
      };

      setToken(data.data.token);
      setUser(userData);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");

      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const activateAccount = async (password: string) => {
    setIsLoading(true);
    try {
      const body = new URLSearchParams();
      body.append(
        "datax",
        JSON.stringify({ token: token, contrasena: password }),
      );

      const response = await fetch(`${API_URL}auth/activar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Account activation failed");
      }

      const userData: User = {
        id: data.data.id,
        name: data.data.nombre,
        lastname: data.data.apellido,
        email: data.data.correo,
        photoUrl: data.data.fotoUrl,
      };

      await AsyncStorage.setItem("token", data.data.token);
      await AsyncStorage.setItem("refreshToken", data.data.refreshToken);

      setToken(data.data.token);
      setUser(userData);
    } catch (error) {
      console.error("Account activation error:", error);
      throw error instanceof Error
        ? error
        : new Error("Account activation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        signUp,
        signOut,
        activateAccount,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
