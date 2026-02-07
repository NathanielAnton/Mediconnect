import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import axiosInstance from "../../../api/axios";
import styles from "./DashboardSecretaire.module.css";
import SecretaireLiaisons from "../liaisons/SecretaireLiaisons";

const DashboardSecretaire = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [rdvAujourdhui, setRdvAujourdhui] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
    fetchRdvAujourdhui();
    fetchPatients();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/secretaire/dashboard");
      setStats(response.data.stats);
      setMedecins(response.data.medecins);
    } catch (error) {
      console.error("Erreur:", error);
      if (error.response?.status === 403) {
        alert("Accès refusé");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRdvAujourdhui = async () => {
    try {
      const response = await axiosInstance.get("/secretaire/rendez-vous/aujourdhui");
      setRdvAujourdhui(response.data.rendez_vous);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axiosInstance.get("/secretaire/patients");
      setPatients(response.data.patients);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const fetchMedecinRendezVous = async (medecinId) => {
    try {
      const response = await axiosInstance.get(`/secretaire/medecins/${medecinId}/rendez-vous`);
      setRendezVous(response.data.rendez_vous);
      setSelectedMedecin(response.data.medecin);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getStatutBadgeClass = (statut) => {
    switch (statut) {
      case "confirmé":
        return styles.badgeConfirmed;
      case "en_attente":
        return styles.badgePending;
      case "annulé":
        return styles.badgeCancelled;
      default:
        return styles.badgePending;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Secrétariat Médical</h1>
        <div className={styles.headerActions}>
          <button onClick={() => navigate("/")} className={styles.btnBack}>
            Retour
          </button>
          <button onClick={handleLogout} className={styles.btnLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.cardGreen}`}>
          <h3 className={styles.statCardTitle}>Médecins</h3>
          <p className={styles.statValue}>{stats?.total_medecins || 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardBlue}`}>
          <h3 className={styles.statCardTitle}>RDV Aujourd'hui</h3>
          <p className={styles.statValue}>{stats?.total_rdv_aujourdhui || 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardPurple}`}>
          <h3 className={styles.statCardTitle}>RDV Cette Semaine</h3>
          <p className={styles.statValue}>{stats?.total_rdv_semaine || 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardOrange}`}>
          <h3 className={styles.statCardTitle}>Patients</h3>
          <p className={styles.statValue}>{stats?.total_patients || 0}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Vue d'ensemble
        </button>
        <button
          className={`${styles.tab} ${activeTab === "medecins" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("medecins")}
        >
          Médecins
        </button>
        <button
          className={`${styles.tab} ${activeTab === "rdv" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("rdv")}
        >
          Rendez-vous du jour
        </button>
        <button
          className={`${styles.tab} ${activeTab === "patients" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("patients")}
        >
          Patients
        </button>
        <button
          className={`${styles.tab} ${activeTab === "liaisons" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("liaisons")}
        >
          Liaisons
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Vue d'ensemble */}
        {activeTab === "overview" && (
          <div className={styles.overviewGrid}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Rendez-vous d'aujourd'hui</h3>
              {rdvAujourdhui.length === 0 ? (
                <p className={styles.emptyMessage}>Aucun rendez-vous aujourd'hui</p>
              ) : (
                <ul className={styles.appointmentsList}>
                  {rdvAujourdhui.slice(0, 5).map((rdv) => (
                    <li key={rdv.id} className={styles.appointmentItem}>
                      <div>
                        <span className={styles.appointmentTime}>
                          {new Date(rdv.date_heure).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className={styles.appointmentDetail}>
                          {rdv.patient.name} - Dr. {rdv.medecin.name}
                        </span>
                      </div>
                      <span className={`${styles.badge} ${getStatutBadgeClass(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Médecins disponibles</h3>
              <ul className={styles.medecinsList}>
                {medecins.slice(0, 5).map((medecin) => (
                  <li key={medecin.id} className={styles.medecinItem}>
                    <div>
                      <strong>{medecin.name}</strong>
                      <br />
                      <small className={styles.specialite}>{medecin.specialite}</small>
                    </div>
                    <button
                      className={styles.btnSmall}
                      onClick={() => {
                        setActiveTab("medecins");
                        fetchMedecinRendezVous(medecin.id);
                      }}
                    >
                      Voir
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Liste des médecins */}
        {activeTab === "medecins" && (
          <div>
            <h3 className={styles.sectionTitle}>Liste des Médecins</h3>
            <div className={styles.medecinsGrid}>
              {medecins.map((medecin) => (
                <div key={medecin.id} className={styles.medecinCard}>
                  <h4>{medecin.name}</h4>
                  <p className={styles.specialite}>{medecin.specialite}</p>
                  <p className={styles.contact}>{medecin.telephone}</p>
                  <p className={styles.contact}>{medecin.adresse}</p>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => fetchMedecinRendezVous(medecin.id)}
                  >
                    Voir les rendez-vous
                  </button>
                </div>
              ))}
            </div>

            {selectedMedecin && (
              <div className={styles.section} style={{ marginTop: "2rem" }}>
                <h3 className={styles.sectionTitle}>Rendez-vous de Dr. {selectedMedecin.name}</h3>
                {rendezVous.length === 0 ? (
                  <p className={styles.emptyMessage}>Aucun rendez-vous</p>
                ) : (
                  <ul className={styles.appointmentsList}>
                    {rendezVous.map((rdv) => (
                      <li key={rdv.id} className={styles.appointmentItem}>
                        <div>
                          <span className={styles.appointmentTime}>
                            {new Date(rdv.date_heure).toLocaleDateString("fr-FR")} -{" "}
                            {new Date(rdv.date_heure).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className={styles.appointmentDetail}>
                            {rdv.patient.name} - {rdv.motif}
                          </span>
                        </div>
                        <span className={`${styles.badge} ${getStatutBadgeClass(rdv.statut)}`}>
                          {rdv.statut}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rendez-vous du jour */}
        {activeTab === "rdv" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tous les rendez-vous d'aujourd'hui</h3>
            {rdvAujourdhui.length === 0 ? (
              <p className={styles.emptyMessage}>Aucun rendez-vous aujourd'hui</p>
            ) : (
              <ul className={styles.appointmentsList}>
                {rdvAujourdhui.map((rdv) => (
                  <li key={rdv.id} className={styles.appointmentItem}>
                    <div>
                      <span className={styles.appointmentTime}>
                        {new Date(rdv.date_heure).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className={styles.appointmentDetail}>
                        {rdv.patient.name} - Dr. {rdv.medecin.name}
                      </span>
                      <small className={styles.motif}>{rdv.motif}</small>
                    </div>
                    <span className={`${styles.badge} ${getStatutBadgeClass(rdv.statut)}`}>
                      {rdv.statut}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Liste des patients */}
        {activeTab === "patients" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Liste des Patients</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.name}</td>
                      <td>{patient.email}</td>
                      <td>{new Date(patient.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Liaisons */}
        {activeTab === "liaisons" && <SecretaireLiaisons />}
      </div>
    </div>
  );
};

export default DashboardSecretaire;
