import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarInner}>
        <div className={styles.navbarContent}>
          {/* Logo et titre */}
          <div className={styles.logo}>
            <svg className={styles.logoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h1 className={styles.logoTitle}>Espace Administrateur</h1>
          </div>

          {/* Navigation links */}
          <div className={styles.navLinks}>
            <a href="#utilisateurs" className={styles.navLink}>
              Utilisateurs
            </a>
            <a href="#statistiques" className={styles.navLink}>
              Statistiques
            </a>
            <a href="#parametres" className={styles.navLink}>
              Paramètres
            </a>
            <a href="#rapports" className={styles.navLink}>
              Rapports
            </a>
            <a href="#systeme" className={styles.navLink}>
              Système
            </a>
          </div>

          {/* User info et déconnexion */}
          <div className={styles.userSection}>
            <span className={styles.userGreeting}>Admin: {user.name}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <svg
                className={styles.logoutIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
