import { X, Calendar, Clock, User, Stethoscope, MessageSquare } from "lucide-react";
import styles from "./ModalDetailRendezVous.module.css";

const ModalDetailRendezVous = ({ appointment, onClose, loading }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      confirmed: { label: "Confirmé", className: styles.statusConfirmed },
      pending: { label: "En attente", className: styles.statusPending },
      en_attente: { label: "En attente", className: styles.statusPending },
      cancelled: { label: "Annulé", className: styles.statusCancelled },
      completed: { label: "Complété", className: styles.statusCompleted },
    };
    const config = statusConfig[statut] || { label: statut, className: styles.statusDefault };
    return <span className={`${styles.badge} ${config.className}`}>{config.label}</span>;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* En-tête */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <h2>Détails du rendez-vous</h2>
            <p className={styles.modalSubtitle}>Informations de votre consultation</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Chargement des détails...</p>
          </div>
        ) : (
          <>
            {/* Informations du rendez-vous */}
            <div className={styles.infoSection}>
              <div className={styles.statusContainer}>{getStatusBadge(appointment.statut)}</div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Stethoscope className={styles.infoIcon} />
                  <div>
                    <label>Médecin</label>
                    <p>Dr. {appointment.medecin?.name || "Non assigné"}</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Calendar className={styles.infoIcon} />
                  <div>
                    <label>Date</label>
                    <p>{formatDate(appointment.date_debut)}</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Clock className={styles.infoIcon} />
                  <div>
                    <label>Horaire</label>
                    <p>
                      {formatTime(appointment.date_debut)} - {formatTime(appointment.date_fin)}
                    </p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <User className={styles.infoIcon} />
                  <div>
                    <label>Patient</label>
                    <p>{appointment.name}</p>
                    <span className={styles.email}>{appointment.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails supplémentaires */}
            <div className={styles.detailsSection}>
              {appointment.motif && (
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>
                    <MessageSquare className={styles.labelIcon} />
                    Motif de la consultation
                  </label>
                  <p className={styles.detailText}>{appointment.motif}</p>
                </div>
              )}

              {appointment.notes && (
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>
                    <MessageSquare className={styles.labelIcon} />
                    Notes supplémentaires
                  </label>
                  <p className={styles.detailText}>{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={styles.modalActions}>
              <button onClick={onClose} className={styles.closeModalButton}>
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalDetailRendezVous;
