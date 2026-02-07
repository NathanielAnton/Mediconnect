import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import axiosInstance from "../../../api/axios";
import styles from "./DashboardGestionnaire.module.css";
import GestionnaireLiaisons from "../liaisons/GestionnaireLiaisons";

const DashboardGestionnaire = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/gestionnaire/dashboard");
      
      // Récupérer les statistiques
      const statsResponse = await axiosInstance.get("/gestionnaire/statistiques");
      setStats(statsResponse.data);

      // Récupérer les utilisateurs
      const usersResponse = await axiosInstance.get("/gestionnaire/users");
      setUsers(usersResponse.data.users || []);
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
        <h1>Gestion Médicale</h1>
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
        <div className={`${styles.statCard} ${styles.cardPink1}`}>
          <h3 className={styles.statCardTitle}>Total Utilisateurs</h3>
          <p className={styles.statValue}>{stats?.total_users || 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardPink2}`}>
          <h3 className={styles.statCardTitle}>Total Médecins</h3>
          <p className={styles.statValue}>{stats?.total_medecins || 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardPink3}`}>
          <h3 className={styles.statCardTitle}>Total Rendez-vous</h3>
          <p className={styles.statValue}>{stats?.total_rdv || 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardPink4}`}>
          <h3 className={styles.statCardTitle}>Secrétaires</h3>
          <p className={styles.statValue}>{stats?.total_secretaires || 0}</p>
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
          className={`${styles.tab} ${activeTab === "users" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Utilisateurs
        </button>
        <button
          className={`${styles.tab} ${activeTab === "statistics" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("statistics")}
        >
          Statistiques
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
              <h3 className={styles.sectionTitle}>Résumé du système</h3>
              <div className={styles.summaryList}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Utilisateurs actifs</span>
                  <span className={styles.summaryValue}>{stats?.total_users || 0}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Médecins enregistrés</span>
                  <span className={styles.summaryValue}>{stats?.total_medecins || 0}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Rendez-vous total</span>
                  <span className={styles.summaryValue}>{stats?.total_rdv || 0}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Secrétaires</span>
                  <span className={styles.summaryValue}>{stats?.total_secretaires || 0}</span>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Actions rapides</h3>
              <div className={styles.actionsGrid}>
                <button className={styles.actionBtn}>
                  Gérer les utilisateurs
                </button>
                <button className={styles.actionBtn}>
                  Voir les rapports
                </button>
                <button className={styles.actionBtn}>
                  Configuration système
                </button>
                <button className={styles.actionBtn}>
                  Gestion des rôles
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des utilisateurs */}
        {activeTab === "users" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Liste des Utilisateurs</h3>
            {users.length === 0 ? (
              <p className={styles.emptyMessage}>Aucun utilisateur</p>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={styles.roleBadge}>
                            {user.roles?.[0] || "N/A"}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString("fr-FR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Statistiques détaillées */}
        {activeTab === "statistics" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Statistiques Détaillées</h3>
            <div className={styles.statsDetailGrid}>
              <div className={styles.statsDetailCard}>
                <h4>Utilisateurs</h4>
                <p className={styles.statsBigNumber}>{stats?.total_users || 0}</p>
                <p className={styles.statsLabel}>Total dans le système</p>
              </div>
              <div className={styles.statsDetailCard}>
                <h4>Médecins</h4>
                <p className={styles.statsBigNumber}>{stats?.total_medecins || 0}</p>
                <p className={styles.statsLabel}>Praticiens actifs</p>
              </div>
              <div className={styles.statsDetailCard}>
                <h4>Rendez-vous</h4>
                <p className={styles.statsBigNumber}>{stats?.total_rdv || 0}</p>
                <p className={styles.statsLabel}>Consultations planifiées</p>
              </div>
              <div className={styles.statsDetailCard}>
                <h4>Secrétaires</h4>
                <p className={styles.statsBigNumber}>{stats?.total_secretaires || 0}</p>
                <p className={styles.statsLabel}>Personnel administratif</p>
              </div>
            </div>
          </div>
        )}

        {/* Liaisons */}
        {activeTab === "liaisons" && <GestionnaireLiaisons />}
      </div>
    </div>
  );
};

export default DashboardGestionnaire;
