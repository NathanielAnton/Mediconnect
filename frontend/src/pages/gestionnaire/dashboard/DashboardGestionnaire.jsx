import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import styles from "./DashboardGestionnaire.module.css";

const DashboardGestionnaire = () => {
  const navigate = useNavigate();
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/gestionnaire/dashboard");
      console.log("Dashboard data:", response.data);

      // Récupérer les statistiques
      const statsResponse = await axiosInstance.get("/gestionnaire/statistiques");
      setStatistiques(statsResponse.data);
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
      if (error.response?.status === 403) {
        alert("Vous n'avez pas les permissions nécessaires");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard Gestionnaire</h1>
        <button onClick={() => navigate("/")} className={styles.btnBack}>
          Retour
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Utilisateurs</h3>
          <p className={styles.statNumber}>{statistiques?.total_users || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Médecins</h3>
          <p className={styles.statNumber}>{statistiques?.total_medecins || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Rendez-vous</h3>
          <p className={styles.statNumber}>{statistiques?.total_rdv || 0}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn}>Gérer les utilisateurs</button>
        <button className={styles.actionBtn}>Voir les rapports</button>
        <button className={styles.actionBtn}>Configuration</button>
      </div>
    </div>
  );
};

export default DashboardGestionnaire;
