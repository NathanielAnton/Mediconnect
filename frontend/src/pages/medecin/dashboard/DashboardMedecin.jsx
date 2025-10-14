import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavbarMedecin from '../components/NavbarMedecin';
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
      {/* Utilisation du composant Navbar */}
      <NavbarMedecin />

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