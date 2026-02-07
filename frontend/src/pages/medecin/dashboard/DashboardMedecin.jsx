import { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavbarMedecin from "../components/NavbarMedecin";
import styles from "./DashboardMedecin.module.css";
import MedecinLiaisons from "../liaisons/MedecinLiaisons";
import MedecinGestionnaireLiaisons from "../liaisons/MedecinGestionnaireLiaisons";

const DashboardMedecin = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('secretaires');

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={styles.container}>
      {/* Utilisation du composant Navbar */}
      <NavbarMedecin />

      {/* Contenu principal */}
      <main className={styles.main}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'secretaires' ? styles.active : ''}`}
              onClick={() => setActiveTab('secretaires')}
            >
              Liaisons Secrétaires
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'gestionnaires' ? styles.active : ''}`}
              onClick={() => setActiveTab('gestionnaires')}
            >
              Liaisons Gestionnaires
            </button>
          </div>
        </div>
        
        <div className={styles.tabContent}>
          {activeTab === 'secretaires' && <MedecinLiaisons />}
          {activeTab === 'gestionnaires' && <MedecinGestionnaireLiaisons />}
        </div>
      </main>
    </div>
  );
};

export default DashboardMedecin;
