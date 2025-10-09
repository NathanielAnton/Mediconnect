import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true); 

  // Initialiser CSRF et récupérer l'utilisateur au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Initialiser CSRF
        await fetch('http://localhost:8000/sanctum/csrf-cookie', {
          method: 'GET',
          credentials: 'include'
        });

        // 2. Si un token existe, récupérer les infos utilisateur
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
          console.log('🔄 Token found, fetching user data...');
          try {
            const userResponse = await api.get("/user");
            setUser(userResponse.data.user);
            setRoles(userResponse.data.roles);
            setToken(savedToken);
            console.log('✅ User data loaded:', userResponse.data.user);
          } catch (error) {
            console.error('❌ Failed to fetch user data:', error);
            logout();
          }
        }
      } catch (error) {
        console.error('❌ Auth init failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {      
      const res = await api.post("/login", { email, password });
      
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setRoles(res.data.roles);
      
      return res;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post("/register", { name, email, password, role });
      return res;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        console.log('🚪 Logging out...');
        const res = await api.post("/logout");
        return res;
      }
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setRoles([]);
      setToken(null);
      console.log('✅ Local state cleared');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      roles, 
      token, 
      login, 
      register, 
      logout,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};