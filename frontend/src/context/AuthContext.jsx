import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
  try {
      const response = await api.get("/user");
      console.log("Réponse API /user:", response.data); 
      setUser(response.data.user);
      setRoles(response.data.roles);
    } catch (error) {
      console.log("Erreur checkAuth:", error); 
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
    <AuthContext.Provider value={{ user, loading, roles, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};