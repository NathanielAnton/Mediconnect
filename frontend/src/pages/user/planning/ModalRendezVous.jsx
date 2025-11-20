import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { X, Calendar, Clock, User, Stethoscope, MessageSquare } from 'lucide-react';
import api from '../../../api/axios';
import styles from './ModalRendezVous.module.css';

const ModalRendezVous = ({ medecin, creneau, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    motif: '',
    notes: ''
  });

  // Formater la date pour l'affichage
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.motif.trim()) {
      alert('Veuillez indiquer le motif de la consultation');
      return;
    }

    setLoading(true);
    console.log(medecin.id);
    try {
      const rendezVousData = {
        medecin_id: medecin.medecin_id,
        client_id: user.id,
        date_debut: creneau.start.toISOString(),
        date_fin: creneau.end.toISOString(),
        motif: formData.motif,
        notes: formData.notes || null,
        statut: 'en_attente'
      };

      console.log('Envoi des données:', rendezVousData);

      const response = await api.post('/rendezvous', rendezVousData);
      
      console.log('Rendez-vous créé:', response.data);
      
      alert('Rendez-vous pris avec succès !');
      onSuccess(response.data.rendezVous);
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la prise de rendez-vous:', error);
      
      let errorMessage = 'Erreur lors de la prise de rendez-vous';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 422) {
        errorMessage = 'Données invalides. Veuillez vérifier les informations.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const motifsPredefinis = [
    'Consultation générale',
    'Suivi médical',
    'Prescription',
    'Bilan de santé',
    'Urgence',
    'Vaccination',
    'Autre'
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* En-tête */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <h2>Prendre un rendez-vous</h2>
            <p className={styles.modalSubtitle}>Confirmez les détails de votre consultation</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Informations du rendez-vous */}
        <div className={styles.infoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Stethoscope className={styles.infoIcon} />
              <div>
                <label>Médecin</label>
                <p>Dr. {medecin.name}</p>
                {medecin.specialite && (
                  <span className={styles.specialite}>{medecin.specialite}</span>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <Calendar className={styles.infoIcon} />
              <div>
                <label>Date</label>
                <p>{formatDate(creneau.start)}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <Clock className={styles.infoIcon} />
              <div>
                <label>Horaire</label>
                <p>{formatTime(creneau.start)} - {formatTime(creneau.end)}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <User className={styles.infoIcon} />
              <div>
                <label>Patient</label>
                <p>{user?.name}</p>
                <span className={styles.email}>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Motif de consultation */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <MessageSquare className={styles.labelIcon} />
              Motif de la consultation *
            </label>
            
            {/* Suggestions de motifs */}
            <div className={styles.motifSuggestions}>
              {motifsPredefinis.map((motif, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.motifChip} ${
                    formData.motif === motif ? styles.motifChipActive : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, motif }))}
                >
                  {motif}
                </button>
              ))}
            </div>

            <textarea
              name="motif"
              placeholder="Décrivez brièvement la raison de votre consultation..."
              value={formData.motif}
              onChange={handleInputChange}
              required
              rows={3}
              className={styles.textarea}
            />
          </div>

          {/* Notes supplémentaires */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Notes supplémentaires (optionnel)
            </label>
            <textarea
              name="notes"
              placeholder="Informations complémentaires, symptômes particuliers, antécédents..."
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className={styles.textarea}
            />
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Prise de rendez-vous...
                </>
              ) : (
                'Confirmer le rendez-vous'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalRendezVous;