import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope,LogOut, LayoutDashboard } from 'lucide-react';
import styles from '../SearchMedecin.module.css';

const Navbar = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Stethoscope className={styles.logoIconSvg} />
            </div>
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
                <button 
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
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