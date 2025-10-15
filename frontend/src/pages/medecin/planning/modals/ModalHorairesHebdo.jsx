import { useState } from "react";
import api from "../../../../api/axios";
import styles from './ModalHorairesHebdo.module.css';

export default function ModalHorairesHebdo({ onClose }) {
  const [jour, setJour] = useState("lundi");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/medecin/horaires", {
        jour,
        heure_debut: heureDebut,
        heure_fin: heureFin,
      });
      alert("Horaire ajouté avec succès !");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'horaire :", error);
      alert("Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer au clic sur l'overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
             Ajouter un horaire hebdomadaire
          </h3>
          <button 
            type="button" 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <span className={styles.infoIcon}>💡</span>
          <span>Définissez vos horaires de disponibilité pour ce jour de la semaine.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Jour */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Jour de la semaine <span className={styles.required}>*</span>
            </label>
            <select 
              className={styles.formSelect} 
              value={jour} 
              onChange={(e) => setJour(e.target.value)}
              required
            >
              <option value="lundi">Lundi</option>
              <option value="mardi">Mardi</option>
              <option value="mercredi">Mercredi</option>
              <option value="jeudi">Jeudi</option>
              <option value="vendredi">Vendredi</option>
              <option value="samedi">Samedi</option>
              <option value="dimanche">Dimanche</option>
            </select>
          </div>

          {/* Heure de début */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              🕐 Heure de début <span className={styles.required}>*</span>
            </label>
            <input 
              type="time" 
              className={styles.formInput} 
              value={heureDebut} 
              onChange={(e) => setHeureDebut(e.target.value)}
              required
            />
          </div>

          {/* Heure de fin */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              🕐 Heure de fin <span className={styles.required}>*</span>
            </label>
            <input 
              type="time" 
              className={styles.formInput} 
              value={heureFin} 
              onChange={(e) => setHeureFin(e.target.value)}
              required
            />
          </div>

          {/* Buttons */}
          <div className={styles.buttonContainer}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}>⏳</span>
                  Enregistrement...
                </>
              ) : (
                <>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}