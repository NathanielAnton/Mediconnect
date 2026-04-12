import { useState } from "react";
import { X, MapPin, Phone, Mail, Building2, User, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./ModalHopital.module.css";
import ModalHoraires from "./ModalHoraires";

export default function ModalHopital({ hopitalDetails, onClose }) {
  const { hopital, medecins_par_specialite: medecinsParSpecialite } = hopitalDetails;

  const [expandedSpecialites, setExpandedSpecialites] = useState(() => {
    const initial = {};
    medecinsParSpecialite.forEach((_, i) => {
      initial[i] = true;
    });
    return initial;
  });
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [showHorairesModal, setShowHorairesModal] = useState(false);

  const toggleSpecialite = (index) => {
    setExpandedSpecialites((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleShowHoraires = (medecin) => {
    setSelectedMedecin(medecin);
    setShowHorairesModal(true);
  };

  const handleCloseHoraires = () => {
    setShowHorairesModal(false);
    setSelectedMedecin(null);
  };

  // Fermer le modal en cliquant sur l'overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleOverlayClick}>
        <div className={styles.modal}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>
                <Building2 className={styles.headerIconSvg} />
              </div>
              <div>
                <h2 className={styles.title}>{hopital.name}</h2>
                <p className={styles.subtitle}>
                  <MapPin className={styles.subtitleIcon} />
                  {hopital.ville}
                </p>
              </div>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X className={styles.closeIcon} />
            </button>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {/* Informations de l'hôpital */}
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Informations</h3>
              <div className={styles.infoGrid}>
                {hopital.adresse && (
                  <div className={styles.infoItem}>
                    <MapPin className={styles.infoIcon} />
                    <span>
                      {hopital.adresse}, {hopital.ville}
                    </span>
                  </div>
                )}
                {hopital.telephone && (
                  <div className={styles.infoItem}>
                    <Phone className={styles.infoIcon} />
                    <span>{hopital.telephone}</span>
                  </div>
                )}
                {hopital.email && (
                  <div className={styles.infoItem}>
                    <Mail className={styles.infoIcon} />
                    <span>{hopital.email}</span>
                  </div>
                )}
              </div>
              {hopital.description && <p className={styles.description}>{hopital.description}</p>}
            </div>

            {/* Liste des médecins par spécialité */}
            <div className={styles.medecinsSection}>
              <h3 className={styles.sectionTitle}>
                Médecins
                {medecinsParSpecialite.length === 0 && (
                  <span className={styles.noMedecins}> — Aucun médecin enregistré</span>
                )}
              </h3>

              {medecinsParSpecialite.map((group, index) => (
                <div key={index} className={styles.specialiteGroup}>
                  <button
                    className={styles.specialiteHeader}
                    onClick={() => toggleSpecialite(index)}
                  >
                    <span className={styles.specialiteName}>{group.specialite}</span>
                    <span className={styles.specialiteCount}>
                      {group.medecins.length} médecin{group.medecins.length > 1 ? "s" : ""}
                    </span>
                    {expandedSpecialites[index] ? (
                      <ChevronUp className={styles.chevron} />
                    ) : (
                      <ChevronDown className={styles.chevron} />
                    )}
                  </button>

                  {expandedSpecialites[index] && (
                    <div className={styles.medecinsGrid}>
                      {group.medecins.map((medecin) => (
                        <div key={medecin.id} className={styles.medecinCard}>
                          <div className={styles.medecinCardLeft}>
                            <div className={styles.medecinAvatar}>
                              {medecin.photo_url ? (
                                <img
                                  src={medecin.photo_url}
                                  alt={`Dr. ${medecin.name}`}
                                  className={styles.medecinAvatarImg}
                                />
                              ) : (
                                <User className={styles.medecinAvatarIcon} />
                              )}
                            </div>
                            <div>
                              <p className={styles.medecinName}>Dr. {medecin.name}</p>
                              {medecin.telephone && (
                                <p className={styles.medecinTel}>
                                  <Phone className={styles.medecinTelIcon} />
                                  {medecin.telephone}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            className={styles.horairesButton}
                            onClick={() => handleShowHoraires(medecin)}
                          >
                            Consulter les horaires
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal des horaires (s'ouvre par-dessus le modal hôpital) */}
      {showHorairesModal && selectedMedecin && (
        <ModalHoraires medecin={selectedMedecin} onClose={handleCloseHoraires} />
      )}
    </>
  );
}
