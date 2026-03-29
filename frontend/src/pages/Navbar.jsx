import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import styles from "./rdv/SearchMedecin.module.css";

const Navbar = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo} onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <img
            src="/logo/fulllogo_transparent_nobuffer.png"
            alt="MediConnect Logo"
            style={{ height: "50px", objectFit: "contain" }}
          />
          <h1 className={styles.logoTitle}>MediConnect</h1>
        </div>

        <div className={styles.headerActions}>
          {loading ? (
            <div className={styles.headerLoading}>
              <div className={styles.headerSpinner}></div>
            </div>
          ) : user ? (
            <>
              <span className={styles.userGreeting}>Bonjour, {user.name}</span>
              <Link to="/dashboard" className={styles.dashboardButton}>
                <LayoutDashboard className={styles.dashboardIcon} />
                <span>Espace personnel</span>
              </Link>
              {!isHome && (
                <Link to="/user/profile" className={styles.dashboardButton}>
                  <User className={styles.dashboardIcon} />
                  <span>Mon Profil</span>
                </Link>
              )}
              <button onClick={handleLogout} className={styles.logoutButton}>
                <LogOut className={styles.logoutIcon} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.loginButton}>
                Se connecter
              </Link>
              <Link to="/register" className={styles.registerButton}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
