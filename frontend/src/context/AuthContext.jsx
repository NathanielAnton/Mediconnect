import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
  try {
      const response = await api.get("/user");
      console.log("Réponse API /user:", response.data); // AJOUTEZ CETTE LIGNE
      setUser(response.data.user);
    } catch (error) {
      console.log("Erreur checkAuth:", error); // AJOUTEZ CETTE LIGNE
      setUser(null);
    } finally {
      setLoading(false);
    }
};

  const login = async (email, password) => {
    const response = await api.post("/login", { email, password });
    setUser(response.data.user);
    return response.data;
  };

  const register = async (name, email, password, role) => {
    const response = await api.post("/register", { name, email, password, role });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post("/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};