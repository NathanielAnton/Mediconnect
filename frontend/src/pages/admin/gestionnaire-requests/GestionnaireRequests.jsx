import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../../../api/axios";
import styles from "./GestionnaireRequests.module.css";

const GestionnaireRequests = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await axios.get("/demande-gestionnaire");
      setDemandes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (id, statut) => {
    setActionLoading(true);
    try {
      await axios.put(`/demande-gestionnaire/${id}/statut`, {
        statut,
        commentaire_admin: commentaire || null,
      });

      // Rafraîchir la liste
      await fetchDemandes();
      setSelectedDemande(null);
      setCommentaire("");
      showToast(`Demande ${statut === "approuvee" ? "approuvée" : "refusée"} avec succès`, "success");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      showToast("Erreur lors de la mise à jour du statut", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDemandes = demandes.filter((demande) => {
    if (filter === "tous") return true;
    return demande.statut === filter;
  });

  const getStatutBadge = (statut) => {
    const badges = {
      en_attente: { text: "En attente", className: styles.badgeWarning },
      approuvee: { text: "Approuvée", className: styles.badgeSuccess },
      refusee: { text: "Refusée", className: styles.badgeDanger },
    };
    return badges[statut] || badges.en_attente;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>Chargement des demandes...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
          <div className={styles.toastContent}>
            {toast.type === "success" && (
              <svg className={styles.toastIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === "error" && (
              <svg className={styles.toastIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Demandes de Compte Gestionnaire</h1>
          <p className={styles.subtitle}>Gérez les demandes de création de comptes gestionnaires</p>
        </div>

        {/* Filtres */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === "tous" ? styles.filterActive : ""}`}
            onClick={() => setFilter("tous")}
          >
            Tous ({demandes.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === "en_attente" ? styles.filterActive : ""}`}
            onClick={() => setFilter("en_attente")}
          >
            En attente ({demandes.filter((d) => d.statut === "en_attente").length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === "approuvee" ? styles.filterActive : ""}`}
            onClick={() => setFilter("approuvee")}
          >
            Approuvées ({demandes.filter((d) => d.statut === "approuvee").length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === "refusee" ? styles.filterActive : ""}`}
            onClick={() => setFilter("refusee")}
          >
            Refusées ({demandes.filter((d) => d.statut === "refusee").length})
          </button>
        </div>

        {/* Liste des demandes */}
        {filteredDemandes.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p>Aucune demande dans cette catégorie</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredDemandes.map((demande) => (
              <div key={demande.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{demande.name}</h3>
                  <span className={getStatutBadge(demande.statut).className}>
                    {getStatutBadge(demande.statut).text}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.info}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{demande.email}</span>
                  </div>
                  <div className={styles.info}>
                    <span className={styles.infoLabel}>Téléphone:</span>
                    <span className={styles.infoValue}>{demande.telephone}</span>
                  </div>
                  <div className={styles.info}>
                    <span className={styles.infoLabel}>Établissement:</span>
                    <span className={styles.infoValue}>{demande.etablissement}</span>
                  </div>
                  <div className={styles.info}>
                    <span className={styles.infoLabel}>Date de demande:</span>
                    <span className={styles.infoValue}>
                      {new Date(demande.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {demande.commentaire_admin && (
                    <div className={styles.commentaire}>
                      <span className={styles.infoLabel}>Commentaire admin:</span>
                      <p className={styles.commentaireText}>{demande.commentaire_admin}</p>
                    </div>
                  )}
                </div>

                {demande.statut === "en_attente" && (
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.btnDetails}
                      onClick={() => setSelectedDemande(demande)}
                    >
                      Traiter la demande
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modale de traitement */}
        {selectedDemande && (
          <div className={styles.modal} onClick={() => setSelectedDemande(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Traiter la demande</h2>
                <button className={styles.modalClose} onClick={() => setSelectedDemande(null)}>
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.demandeDetails}>
                  <h3>{selectedDemande.name}</h3>
                  <p>
                    <strong>Email:</strong> {selectedDemande.email}
                  </p>
                  <p>
                    <strong>Téléphone:</strong> {selectedDemande.telephone}
                  </p>
                  <p>
                    <strong>Établissement:</strong> {selectedDemande.etablissement}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedDemande.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Commentaire (optionnel)</label>
                  <textarea
                    className={styles.textarea}
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Ajoutez un commentaire pour cette décision..."
                    rows={4}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  onClick={() => handleUpdateStatut(selectedDemande.id, "approuvee")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Traitement..." : "✓ Approuver"}
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleUpdateStatut(selectedDemande.id, "refusee")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Traitement..." : "✗ Refuser"}
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setSelectedDemande(null)}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GestionnaireRequests;
