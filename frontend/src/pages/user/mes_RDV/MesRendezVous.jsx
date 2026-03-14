import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import styles from "./MesRendezVous.module.css";
import { ArrowLeft, Calendar, User, FileText } from "lucide-react";
import ModalDetailRendezVous from "./ModalDetailRendezVous";

const MesRendezVous = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get("/client/rendez-vous");
        const data = response.data.rendez_vous || [];
        setAppointments(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = async (appointmentId) => {
    setLoadingDetail(true);
    try {
      const response = await api.get(`/client/rendez-vous/${appointmentId}`);
      setSelectedAppointment(response.data.rendezVous);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    switch (filter) {
      case "upcoming":
        return appointments.filter((apt) => new Date(apt.date_debut) > now);
      case "past":
        return appointments.filter((apt) => new Date(apt.date_debut) <= now);
      default:
        return appointments;
    }
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      confirmed: { label: "Confirmé", className: styles.statusConfirmed },
      pending: { label: "En attente", className: styles.statusPending },
      cancelled: { label: "Annulé", className: styles.statusCancelled },
      completed: { label: "Complété", className: styles.statusCompleted },
    };
    const config = statusConfig[statut] || { label: statut, className: styles.statusDefault };
    return <span className={`${styles.badge} ${config.className}`}>{config.label}</span>;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navbarInner}>
          <div className={styles.navbarContent}>
            <button onClick={() => navigate("/dashboard")} className={styles.backButton}>
              <ArrowLeft size={20} />
              <span>Retour</span>
            </button>
            <h1 className={styles.navTitle}>Mes Rendez-vous</h1>
            <div className={styles.userSection}>
              <span className={styles.userGreeting}>Bonjour, {user?.name}</span>
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

      {/* Contenu principal */}
      <main className={styles.main}>
        <div className={styles.content}>
          {/* Filtres */}
          <div className={styles.filters}>
            <button
              className={filter === "all" ? styles.filterActive : styles.filterInactive}
              onClick={() => setFilter("all")}
            >
              Tous ({appointments.length})
            </button>
            <button
              className={filter === "upcoming" ? styles.filterActive : styles.filterInactive}
              onClick={() => setFilter("upcoming")}
            >
              À venir ({appointments.filter((apt) => new Date(apt.date_debut) > new Date()).length})
            </button>
            <button
              className={filter === "past" ? styles.filterActive : styles.filterInactive}
              onClick={() => setFilter("past")}
            >
              Passés ({appointments.filter((apt) => new Date(apt.date_debut) <= new Date()).length})
            </button>
          </div>

          {/* Liste des rendez-vous */}
          {loading ? (
            <div className={styles.loading}>Chargement des rendez-vous...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className={styles.empty}>
              <Calendar size={48} className={styles.emptyIcon} />
              <p>Aucun rendez-vous {filter !== "all" ? "pour ce filtre" : "programmé"}</p>
            </div>
          ) : (
            <div className={styles.appointmentsList}>
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className={styles.appointmentCard}>
                  <div className={styles.appointmentHeader}>
                    <div className={styles.appointmentTitle}>
                      <Calendar size={20} />
                      <span>{formatDate(apt.date_debut)}</span>
                    </div>
                    {getStatusBadge(apt.statut)}
                  </div>

                  <div className={styles.appointmentBody}>
                    <div className={styles.infoRow}>
                      <User size={18} />
                      <span>
                        <strong>Médecin:</strong> Dr. {apt.medecin?.name || "Non assigné"}
                      </span>
                    </div>

                    {apt.motif && (
                      <div className={styles.infoRow}>
                        <FileText size={18} />
                        <span>
                          <strong>Motif:</strong> {apt.motif}
                        </span>
                      </div>
                    )}

                    {apt.notes && (
                      <div className={styles.infoRow}>
                        <span>
                          <strong>Notes:</strong> {apt.notes}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.appointmentFooter}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewDetails(apt.id)}
                      disabled={loadingDetail}
                    >
                      {loadingDetail ? "Chargement..." : "Voir les détails"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de détails */}
      {selectedAppointment && (
        <ModalDetailRendezVous
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          loading={loadingDetail}
        />
      )}
    </div>
  );
};

export default MesRendezVous;
