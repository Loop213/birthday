import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { extractErrorMessage } from "../api/http.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("birthday-glow-token") || ""
  );
  const [loading, setLoading] = useState(Boolean(token));

  async function hydrateUser() {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data.user);
    } catch (error) {
      localStorage.removeItem("birthday-glow-token");
      setToken("");
      setUser(null);
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    hydrateUser();
  }, [token]);

  function persistAuth(nextToken, nextUser) {
    localStorage.setItem("birthday-glow-token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  async function login(payload) {
    const response = await api.post("/auth/login", payload);
    persistAuth(response.data.data.token, response.data.data.user);
    return response.data.data.user;
  }

  async function signup(payload) {
    const response = await api.post("/auth/signup", payload);
    persistAuth(response.data.data.token, response.data.data.user);
    return response.data.data.user;
  }

  function logout() {
    localStorage.removeItem("birthday-glow-token");
    setToken("");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        refreshUser: hydrateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
