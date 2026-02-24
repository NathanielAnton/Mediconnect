import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavbarMedecin from "../components/NavbarMedecin";
import styles from "./DashboardMedecin.module.css";
import MedecinLiaisons from "../liaisons/MedecinLiaisons";
import MedecinGestionnaireLiaisons from "../liaisons/MedecinGestionnaireLiaisons";
import api from "../../../api/axios";

const DashboardMedecin = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données des rendez-vous au montage du composant
  useEffect(() => {
    const loadAppointmentsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les rendez-vous d'aujourd'hui
        const todayResponse = await api.get("/medecin/rendez-vous/aujourd-hui");
        const todayData = todayResponse.data;

        setTodayAppointments(todayData.rendez_vous || []);
        setTodayCount(todayData.count || 0);

        // Récupérer les rendez-vous du mois
        const monthResponse = await api.get("/medecin/rendez-vous/mois");
        const monthData = monthResponse.data;

        setMonthCount(monthData.count || 0);
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous:", err);
        setError("Impossible de charger les rendez-vous");
      } finally {
        setLoading(false);
      }
    };

    loadAppointmentsData();
  }, []);

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
              className={`${styles.tab} ${activeTab === "dashboard" ? styles.active : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Tableau de bord
            </button>
            <button
              className={`${styles.tab} ${activeTab === "secretaires" ? styles.active : ""}`}
              onClick={() => setActiveTab("secretaires")}
            >
              Liaisons Secrétaires
            </button>
            <button
              className={`${styles.tab} ${activeTab === "gestionnaires" ? styles.active : ""}`}
              onClick={() => setActiveTab("gestionnaires")}
            >
              Liaisons Gestionnaires
            </button>
          </div>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "dashboard" && (
            <div className={styles.dashboard}>
              <h2 className={styles.dashboardTitle}>Tableau de Bord Médical</h2>

              <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.cardGreen}`}>
                  <h3 className={`${styles.statCardTitle} ${styles.titleGreen}`}>
                    Rendez-vous Aujourd'hui
                  </h3>
                  <p className={`${styles.statValue} ${styles.valueGreen}`}>{todayCount}</p>
                </div>
                <div className={`${styles.statCard} ${styles.cardBlue}`}>
                  <h3 className={`${styles.statCardTitle} ${styles.titleBlue}`}>
                    Patients en Attente
                  </h3>
                  <p className={`${styles.statValue} ${styles.valueBlue}`}>
                    {todayAppointments.filter((apt) => apt.statut === "en_attente").length}
                  </p>
                </div>
                <div className={`${styles.statCard} ${styles.cardPurple}`}>
                  <h3 className={`${styles.statCardTitle} ${styles.titlePurple}`}>
                    Consultations du Mois
                  </h3>
                  <p className={`${styles.statValue} ${styles.valuePurple}`}>{monthCount}</p>
                </div>
                <div className={`${styles.statCard} ${styles.cardOrange}`}>
                  <h3 className={`${styles.statCardTitle} ${styles.titleOrange}`}>
                    Prescriptions en Cours
                  </h3>
                  <p className={`${styles.statValue} ${styles.valueOrange}`}>XXXX</p>
                </div>
              </div>

              <div className={styles.contentGrid}>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Rendez-vous du Jour</h3>
                  <ul className={styles.appointmentsList}>
                    {loading ? (
                      <li className={styles.appointmentItem}>
                        <span>Chargement des rendez-vous...</span>
                      </li>
                    ) : error ? (
                      <li className={styles.appointmentItem}>
                        <span style={{ color: "red" }}>{error}</span>
                      </li>
                    ) : todayAppointments.length > 0 ? (
                      todayAppointments.map((appointment) => (
                        <li key={appointment.id} className={styles.appointmentItem}>
                          <span className={styles.appointmentTime}>
                            {new Date(appointment.date_debut).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            - {appointment.name}
                          </span>
                          <span
                            className={`${styles.badge} ${
                              appointment.statut === "confirmé"
                                ? styles.badgeConfirmed
                                : appointment.statut === "en_attente"
                                  ? styles.badgePending
                                  : appointment.statut === "annulé"
                                    ? styles.badgeCancelled
                                    : styles.badgePending
                            }`}
                          >
                            {appointment.statut === "confirmé"
                              ? "Confirmé"
                              : appointment.statut === "en_attente"
                                ? "En attente"
                                : appointment.statut === "annulé"
                                  ? "Annulé"
                                  : appointment.statut}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className={styles.appointmentItem}>
                        <span>Aucun rendez-vous aujourd'hui</span>
                      </li>
                    )}
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
          )}
          {activeTab === "secretaires" && <MedecinLiaisons />}
          {activeTab === "gestionnaires" && <MedecinGestionnaireLiaisons />}
        </div>
      </main>
    </div>
  );
};

export default DashboardMedecin;
