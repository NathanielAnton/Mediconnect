import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardMedecin.module.css';

const DashboardMedecin = () => {
  const { user, logout } = useContext(AuthContext);
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
    <div className={styles.container}>
      {/* Navbar Médecin */}
      <nav className={styles.navbar}>
        <div className={styles.navbarInner}>
          <div className={styles.navbarContent}>
            {/* Logo et titre */}
            <div className={styles.logo}>
              <svg className={styles.logoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h1 className={styles.logoTitle}>Espace Médecin</h1>
            </div>

            {/* Navigation links */}
            <div className={styles.navLinks}>
              <a href="#planning" className={styles.navLink}>
                Planning
              </a>
              <a href="#patients" className={styles.navLink}>
                Dossiers Patients
              </a>
              <a href="#consultations" className={styles.navLink}>
                Consultations
              </a>
              <a href="#prescriptions" className={styles.navLink}>
                Prescriptions
              </a>
              <a href="#statistiques" className={styles.navLink}>
                Statistiques
              </a>
            </div>

            {/* User info et déconnexion */}
            <div className={styles.userSection}>
              <span className={styles.userGreeting}>Dr. {user.name}</span>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                <svg className={styles.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className={styles.main}>
        <div className={styles.dashboard}>
          <h2 className={styles.dashboardTitle}>Tableau de Bord Médical</h2>
          
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.cardGreen}`}>
              <h3 className={`${styles.statCardTitle} ${styles.titleGreen}`}>
                Rendez-vous Aujourd'hui
              </h3>
              <p className={`${styles.statValue} ${styles.valueGreen}`}>8</p>
            </div>
            <div className={`${styles.statCard} ${styles.cardBlue}`}>
              <h3 className={`${styles.statCardTitle} ${styles.titleBlue}`}>
                Patients en Attente
              </h3>
              <p className={`${styles.statValue} ${styles.valueBlue}`}>3</p>
            </div>
            <div className={`${styles.statCard} ${styles.cardPurple}`}>
              <h3 className={`${styles.statCardTitle} ${styles.titlePurple}`}>
                Consultations du Mois
              </h3>
              <p className={`${styles.statValue} ${styles.valuePurple}`}>156</p>
            </div>
            <div className={`${styles.statCard} ${styles.cardOrange}`}>
              <h3 className={`${styles.statCardTitle} ${styles.titleOrange}`}>
                Prescriptions en Cours
              </h3>
              <p className={`${styles.statValue} ${styles.valueOrange}`}>24</p>
            </div>
          </div>

          <div className={styles.contentGrid}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Rendez-vous du Jour</h3>
              <ul className={styles.appointmentsList}>
                <li className={styles.appointmentItem}>
                  <span className={styles.appointmentTime}>09:00 - Jean Dupont</span>
                  <span className={`${styles.badge} ${styles.badgeConfirmed}`}>
                    Confirmé
                  </span>
                </li>
                <li className={styles.appointmentItem}>
                  <span className={styles.appointmentTime}>10:30 - Marie Martin</span>
                  <span className={`${styles.badge} ${styles.badgePending}`}>
                    En attente
                  </span>
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Actions Rapides</h3>
              <div className={styles.actionsGrid}>
                <button className={`${styles.actionButton} ${styles.actionButtonGreen}`}>
                  Nouvelle Consultation
                </button>
                <button className={`${styles.actionButton} ${styles.actionButtonBlue}`}>
                  Voir le Planning
                </button>
                <button className={`${styles.actionButton} ${styles.actionButtonPurple}`}>
                  Gérer les Dossiers
                </button>
                <button className={`${styles.actionButton} ${styles.actionButtonOrange}`}>
                  Rédiger Ordonnance
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardMedecin;