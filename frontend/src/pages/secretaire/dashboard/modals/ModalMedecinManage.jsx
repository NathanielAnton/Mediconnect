import { useState, useEffect } from "react";
import axiosInstance from "../../../../api/axios";
import styles from "./ModalMedecinManage.module.css";
import ModalPlanningMedecin from "./ModalPlanningMedecin";

const ModalMedecinManage = ({ medecin, onClose, onSuccess }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPlanningEditModal, setShowPlanningEditModal] = useState(false);
  const [showPlanningViewModal, setShowPlanningViewModal] = useState(false);

  const handleAction = (actionType) => {
    switch (actionType) {
      case "view-profile":
        setShowProfileModal(true);
        break;
      case "edit-planning":
        setShowPlanningEditModal(true);
        break;
      case "view-planning":
        setShowPlanningViewModal(true);
        break;
      default:
        break;
    }
  };

  if (showProfileModal) {
    return (
      <ModalProfileView
        medecin={medecin}
        onClose={() => setShowProfileModal(false)}
        onBack={() => setShowProfileModal(false)}
      />
    );
  }

  if (showPlanningEditModal) {
    return (
      <ModalPlanningEdit
        medecin={medecin}
        onClose={() => setShowPlanningEditModal(false)}
        onSuccess={onSuccess}
      />
    );
  }

  if (showPlanningViewModal) {
    return <ModalPlanningView medecin={medecin} onClose={() => setShowPlanningViewModal(false)} />;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Gérer - Dr. {medecin.name}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.actionsGrid}>
            <div
              className={styles.actionCard}
              onClick={() => handleAction("view-profile")}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.actionIcon}>👤</div>
              <h3>Voir le Profil</h3>
              <p>Consulter les informations du médecin</p>
            </div>

            <div
              className={styles.actionCard}
              onClick={() => handleAction("edit-planning")}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.actionIcon}>📝</div>
              <h3>Modifier le Planning</h3>
              <p>Ajouter disponibilités et indisponibilités</p>
            </div>

            <div
              className={styles.actionCard}
              onClick={() => handleAction("view-planning")}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.actionIcon}>📅</div>
              <h3>Consulter Planning</h3>
              <p>Voir le planning complet du médecin</p>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal pour voir le profil du médecin
const ModalProfileView = ({ medecin, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [medecin.id]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(`/secretaire/medecins/${medecin.id}/profile`);
      setProfile(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors du chargement du profil");
      console.error("Erreur profil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.subModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.subModalHeader}>
          <h3>Profil - Dr. {medecin.name}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {loading && (
          <div className={styles.profileContent}>
            <p>Chargement...</p>
          </div>
        )}
        {error && (
          <div className={styles.profileContent}>
            <p style={{ color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {profile && (
          <div className={styles.profileContent}>
            <div className={styles.profileField}>
              <label>Nom:</label>
              <p>{profile.name}</p>
            </div>
            <div className={styles.profileField}>
              <label>Spécialité:</label>
              <p>{profile.specialite || "Non spécifiée"}</p>
            </div>
            <div className={styles.profileField}>
              <label>Téléphone:</label>
              <p>{profile.telephone || "Non fourni"}</p>
            </div>
            <div className={styles.profileField}>
              <label>Adresse:</label>
              <p>{profile.adresse || "Non fournie"}</p>
            </div>
            <div className={styles.profileField}>
              <label>Ville:</label>
              <p>{profile.ville || "Non fournie"}</p>
            </div>
            <div className={styles.profileField}>
              <label>Description:</label>
              <p>{profile.description || "Aucune description"}</p>
            </div>
          </div>
        )}

        <div className={styles.subModalFooter}>
          <button className={styles.btnClose} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal pour éditer le planning
const ModalPlanningEdit = ({ medecin, onClose, onSuccess }) => {
  const [horaires, setHoraires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showIndisponibiliteModal, setShowIndisponibiliteModal] = useState(false);

  const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const creneaux = ["matin", "apres_midi"];

  const defaultHeuresParCreneau = {
    matin: { heure_debut: "08:30", heure_fin: "12:30" },
    apres_midi: { heure_debut: "13:30", heure_fin: "17:00" },
  };

  // Charger les horaires existants
  useEffect(() => {
    const fetchHoraires = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/secretaire/medecins/${medecin.id}/planning`);
        setHoraires(res.data.horaires || []);
      } catch (err) {
        console.error("Erreur lors du chargement des horaires:", err);
        setMessage("Erreur lors du chargement des horaires");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    fetchHoraires();
  }, [medecin.id]);

  if (showIndisponibiliteModal) {
    return (
      <ModalIndisponibiliteEdit
        medecin={medecin}
        onClose={() => setShowIndisponibiliteModal(false)}
        onSuccess={onSuccess}
      />
    );
  }

  const getHoraire = (jour, creneau) => {
    return horaires.find((h) => h.jour === jour && h.creneau === creneau);
  };

  const updateHoraire = (jour, creneau, field, value) => {
    setHoraires((prev) => {
      const existing = prev.find((h) => h.jour === jour && h.creneau === creneau);

      if (existing) {
        return prev.map((h) =>
          h.jour === jour && h.creneau === creneau ? { ...h, [field]: value } : h
        );
      } else {
        return [
          ...prev,
          {
            jour,
            creneau,
            ...defaultHeuresParCreneau[creneau],
            actif: true,
            [field]: value,
          },
        ];
      }
    });
  };

  const toggleActif = (jour, creneau) => {
    const horaire = getHoraire(jour, creneau);
    const newActif = horaire ? !horaire.actif : true;
    updateHoraire(jour, creneau, "actif", newActif);
  };

  const appliquerATous = (creneau) => {
    const premierJour = horaires.find((h) => h.creneau === creneau && h.actif);
    if (!premierJour) return;

    jours.forEach((jour) => {
      updateHoraire(jour, creneau, "heure_debut", premierJour.heure_debut);
      updateHoraire(jour, creneau, "heure_fin", premierJour.heure_fin);
      updateHoraire(jour, creneau, "actif", true);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await axiosInstance.put(`/secretaire/medecins/${medecin.id}/horaires`, { horaires });
      setMessage("Horaires mis à jour avec succès !");
      setMessageType("success");
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setMessage(err.response?.data?.message || "Erreur lors de la sauvegarde");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.subModalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.subModalHeader}>
            <h3>Modifier le Planning - Dr. {medecin.name}</h3>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles.planningEditContent}>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.subModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.subModalHeader}>
          <h3>Modifier les Disponibilités - Dr. {medecin.name}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: "1rem",
              margin: "0 1rem 1rem 1rem",
              borderRadius: "8px",
              fontWeight: "500",
              backgroundColor: messageType === "success" ? "#d1fae5" : "#fee2e2",
              color: messageType === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${messageType === "success" ? "#6ee7b7" : "#fca5a5"}`,
            }}
          >
            {message}
          </div>
        )}

        <div className={styles.planningEditContent}>
          {/* Section Matin */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ margin: 0, color: "#374151", fontSize: "1.1rem" }}>
                🌅 Créneaux du matin
              </h4>
              <button
                onClick={() => appliquerATous("matin")}
                style={{
                  fontSize: "0.875rem",
                  backgroundColor: "#dbeafe",
                  color: "#0c4a6e",
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#bfdbfe")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dbeafe")}
              >
                Appliquer à tous
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {jours.map((jour) => {
                const horaire = getHoraire(jour, "matin");
                return (
                  <div
                    key={`${jour}-matin`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      backgroundColor: "#f3f4f6",
                      padding: "0.75rem",
                      borderRadius: "0.375rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={horaire?.actif ?? false}
                      onChange={() => toggleActif(jour, "matin")}
                      style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                    />
                    <span style={{ width: "6rem", fontWeight: "500", textTransform: "capitalize" }}>
                      {jour}
                    </span>
                    <input
                      type="time"
                      value={horaire?.heure_debut ?? "08:30"}
                      onChange={(e) => updateHoraire(jour, "matin", "heure_debut", e.target.value)}
                      disabled={!horaire?.actif}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        opacity: horaire?.actif ? 1 : 0.5,
                        cursor: horaire?.actif ? "text" : "not-allowed",
                      }}
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={horaire?.heure_fin ?? "12:30"}
                      onChange={(e) => updateHoraire(jour, "matin", "heure_fin", e.target.value)}
                      disabled={!horaire?.actif}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        opacity: horaire?.actif ? 1 : 0.5,
                        cursor: horaire?.actif ? "text" : "not-allowed",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Après-midi */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ margin: 0, color: "#374151", fontSize: "1.1rem" }}>
                🌞 Créneaux de l'après-midi
              </h4>
              <button
                onClick={() => appliquerATous("apres_midi")}
                style={{
                  fontSize: "0.875rem",
                  backgroundColor: "#dbeafe",
                  color: "#0c4a6e",
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#bfdbfe")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dbeafe")}
              >
                Appliquer à tous
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {jours.map((jour) => {
                const horaire = getHoraire(jour, "apres_midi");
                return (
                  <div
                    key={`${jour}-apres_midi`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      backgroundColor: "#f3f4f6",
                      padding: "0.75rem",
                      borderRadius: "0.375rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={horaire?.actif ?? false}
                      onChange={() => toggleActif(jour, "apres_midi")}
                      style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                    />
                    <span style={{ width: "6rem", fontWeight: "500", textTransform: "capitalize" }}>
                      {jour}
                    </span>
                    <input
                      type="time"
                      value={horaire?.heure_debut ?? "13:30"}
                      onChange={(e) =>
                        updateHoraire(jour, "apres_midi", "heure_debut", e.target.value)
                      }
                      disabled={!horaire?.actif}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        opacity: horaire?.actif ? 1 : 0.5,
                        cursor: horaire?.actif ? "text" : "not-allowed",
                      }}
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={horaire?.heure_fin ?? "17:00"}
                      onChange={(e) =>
                        updateHoraire(jour, "apres_midi", "heure_fin", e.target.value)
                      }
                      disabled={!horaire?.actif}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        opacity: horaire?.actif ? 1 : 0.5,
                        cursor: horaire?.actif ? "text" : "not-allowed",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              backgroundColor: "#dbeafe",
              border: "1px solid #7dd3fc",
              borderRadius: "0.375rem",
              padding: "1rem",
              fontSize: "0.875rem",
              color: "#0c4a6e",
            }}
          >
            💡 <strong>Astuce :</strong> Cochez la case pour activer un créneau, puis définissez les
            heures. Utilisez "Appliquer à tous" pour copier les horaires sur toute la semaine.
          </div>
        </div>

        <div className={styles.subModalFooter}>
          <button className={styles.btnClose} onClick={onClose}>
            Annuler
          </button>
          <button
            style={{
              padding: "0.75rem 1.5rem",
              background: "#ea580c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              marginLeft: "auto",
              marginRight: "0.5rem",
            }}
            onClick={() => setShowIndisponibiliteModal(true)}
          >
            Gérer Indisponibilités
          </button>
          <button
            className={styles.btnAdd}
            onClick={handleSave}
            disabled={saving}
            style={{ opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal pour gérer les indisponibilités
const ModalIndisponibiliteEdit = ({ medecin, onClose, onSuccess }) => {
  const [indisponibilites, setIndisponibilites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [newIndispo, setNewIndispo] = useState({
    date_debut: "",
    date_fin: "",
    motif: "",
  });

  useEffect(() => {
    const fetchIndispos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/secretaire/medecins/${medecin.id}/planning`);
        setIndisponibilites(res.data.indisponibilites || []);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setMessage("Erreur lors du chargement");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    fetchIndispos();
  }, [medecin.id]);

  const handleAddIndispo = async () => {
    if (!newIndispo.date_debut || !newIndispo.date_fin) {
      setMessage("Veuillez remplir les dates");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await axiosInstance.post(`/secretaire/medecins/${medecin.id}/indisponibilites`, newIndispo);
      setMessage("Indisponibilité ajoutée avec succès");
      setMessageType("success");
      setNewIndispo({ date_debut: "", date_fin: "", motif: "" });
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur:", err);
      setMessage(err.response?.data?.message || "Erreur lors de l'ajout");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.subModalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.subModalHeader}>
            <h3>Gérer Indisponibilités - Dr. {medecin.name}</h3>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles.planningEditContent}>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.subModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.subModalHeader}>
          <h3>Gérer Indisponibilités - Dr. {medecin.name}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: "1rem",
              margin: "0 1rem 1rem 1rem",
              borderRadius: "8px",
              fontWeight: "500",
              backgroundColor: messageType === "success" ? "#d1fae5" : "#fee2e2",
              color: messageType === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${messageType === "success" ? "#6ee7b7" : "#fca5a5"}`,
            }}
          >
            {message}
          </div>
        )}

        <div className={styles.planningEditContent}>
          <div className={styles.editSection}>
            <h4 style={{ marginBottom: "1rem" }}>Ajouter une indisponibilité</h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "0.5rem",
                    fontSize: "0.95rem",
                  }}
                >
                  Date de début:
                </label>
                <input
                  type="date"
                  value={newIndispo.date_debut}
                  onChange={(e) => setNewIndispo({ ...newIndispo, date_debut: e.target.value })}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "0.5rem",
                    fontSize: "0.95rem",
                  }}
                >
                  Date de fin:
                </label>
                <input
                  type="date"
                  value={newIndispo.date_fin}
                  onChange={(e) => setNewIndispo({ ...newIndispo, date_fin: e.target.value })}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
              <label
                style={{
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Motif (optionnel):
              </label>
              <input
                type="text"
                placeholder="Ex: Congés, Formation, Conférence..."
                value={newIndispo.motif}
                onChange={(e) => setNewIndispo({ ...newIndispo, motif: e.target.value })}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              onClick={handleAddIndispo}
              disabled={saving}
              style={{
                padding: "0.75rem 1.5rem",
                background: saving ? "#bfdbfe" : "#f97316",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                marginTop: "1rem",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => !saving && (e.target.style.background = "#ea580c")}
              onMouseOut={(e) => !saving && (e.target.style.background = "#f97316")}
            >
              {saving ? "Ajout en cours..." : "Ajouter Indisponibilité"}
            </button>
          </div>

          {/* Liste des indisponibilités existantes */}
          {indisponibilites.length > 0 && (
            <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #e5e7eb" }}>
              <h4 style={{ marginBottom: "1rem" }}>Indisponibilités existantes</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {indisponibilites.map((indispo, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "1rem",
                      backgroundColor: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div>
                        <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "500" }}>
                          Du
                        </label>
                        <p style={{ margin: "0.25rem 0 0 0", fontWeight: "600" }}>
                          {indispo.date_debut}
                        </p>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "500" }}>
                          Au
                        </label>
                        <p style={{ margin: "0.25rem 0 0 0", fontWeight: "600" }}>
                          {indispo.date_fin}
                        </p>
                      </div>
                    </div>
                    {indispo.motif && (
                      <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                        Motif: {indispo.motif}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.subModalFooter}>
          <button className={styles.btnClose} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal pour visualiser le planning existant
const ModalPlanningView = ({ medecin, onClose }) => {
  return <ModalPlanningMedecin medecin={medecin} onClose={onClose} onSuccess={onClose} />;
};

export default ModalMedecinManage;
