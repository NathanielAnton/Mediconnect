import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { X, Calendar, Clock, User, Stethoscope, MessageSquare, Trash2 } from "lucide-react";
import api from "../../../../api/axios";
import styles from "./ModalUpdateRendezVous.module.css";

const ModalUpdateRendezVous = ({ rendezVous, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toastTimerRef = useRef(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [formData, setFormData] = useState({
    motif: rendezVous?.motif || "",
    notes: rendezVous?.notes || "",
    statut: rendezVous?.statut || "en_attente",
  });

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ show: true, message, type });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, duration);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.motif.trim()) {
      showToast("Veuillez indiquer le motif", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        motif: formData.motif,
        notes: formData.notes || null,
        statut: formData.statut,
      };

      await api.put(`/rendezvous/${rendezVous.id}`, payload);
      showToast("Rendez-vous mis à jour avec succès !", "success", 1200);
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      let errorMessage = "Erreur lors de la mise à jour";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Confirmez-vous la suppression de ce rendez-vous ?")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/rendezvous/${rendezVous.id}`);
      showToast("Rendez-vous supprimé avec succès !", "success", 1200);
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      let errorMessage = "Erreur lors de la suppression";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const statuts = ["en_attente", "confirmé", "annulé"];
  const motifs = ["Consultation générale", "Suivi", "Prescription", "Bilan", "Urgence", "Autre"];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        {toast.show && (
          <div
            className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}
          >
            <span>{toast.message}</span>
          </div>
        )}

        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <h2>Modifier le rendez-vous</h2>
            <p className={styles.modalSubtitle}>Mettez à jour les détails de la consultation</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Stethoscope className={styles.infoIcon} />
              <div>
                <label>Médecin</label>
                <p>Dr. {rendezVous?.medecin?.name}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <Calendar className={styles.infoIcon} />
              <div>
                <label>Date</label>
                <p>{formatDate(rendezVous?.date_debut)}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <Clock className={styles.infoIcon} />
              <div>
                <label>Horaire</label>
                <p>
                  {formatTime(rendezVous?.date_debut)} - {formatTime(rendezVous?.date_fin)}
                </p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <User className={styles.infoIcon} />
              <div>
                <label>Patient</label>
                <p>{rendezVous?.patient?.name}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="en_attente">En attente</option>
              <option value="confirmé">Confirmé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <MessageSquare className={styles.labelIcon} />
              Motif du rendez-vous *
            </label>

            <div className={styles.motifSuggestions}>
              {motifs.map((motif) => (
                <button
                  key={motif}
                  type="button"
                  className={`${styles.motifChip} ${formData.motif === motif ? styles.motifChipActive : ""}`}
                  onClick={() => setFormData((prev) => ({ ...prev, motif }))}
                >
                  {motif}
                </button>
              ))}
            </div>

            <textarea
              name="motif"
              value={formData.motif}
              onChange={handleInputChange}
              placeholder="Motif de la consultation..."
              rows={3}
              required
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes (optionnel)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notes additionnelles..."
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={handleDelete}
              className={styles.deleteButton}
              disabled={loading}
            >
              <Trash2 size={16} />
              Supprimer
            </button>
            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={loading}
              >
                Annuler
              </button>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUpdateRendezVous;
