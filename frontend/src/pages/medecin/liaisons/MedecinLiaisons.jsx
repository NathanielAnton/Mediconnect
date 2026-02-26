import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import "./MedecinLiaisons.css";

function MedecinLiaisons() {
  const [demandes, setDemandes] = useState([]);
  const [liaisons, setLiaisons] = useState([]);
  const [activeTab, setActiveTab] = useState("demandes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchDemandes();
    fetchLiaisons();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await axiosInstance.get("/medecin/liaisons-secretaire/demandes");
      setDemandes(response.data.demandes || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des demandes:", err);
    }
  };

  const fetchLiaisons = async () => {
    try {
      const response = await axiosInstance.get("/medecin/liaisons-secretaire");
      setLiaisons(response.data.secretaires || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des liaisons:", err);
    }
  };

  const handleAccept = async (id) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.patch(`/medecin/liaisons-secretaire/${id}/accepter`);
      setSuccess(response.data.message);
      fetchDemandes();
      fetchLiaisons();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'acceptation");
    } finally {
      setLoading(false);
    }
  };

  const handleRefuse = async (id) => {
    if (!window.confirm("Voulez-vous vraiment refuser cette demande ?")) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.patch(`/medecin/liaisons-secretaire/${id}/refuser`);
      setSuccess(response.data.message);
      fetchDemandes();
      fetchLiaisons();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du refus");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette liaison ?")) return;

    try {
      await axiosInstance.delete(`/medecin/liaisons-secretaire/${id}`);
      setSuccess("Liaison supprimée avec succès");
      fetchLiaisons();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      en_attente: { label: "En attente", class: "badge-warning" },
      accepte: { label: "Accepté", class: "badge-success" },
      refuse: { label: "Refusé", class: "badge-danger" },
    };
    const badge = badges[statut] || badges.en_attente;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="medecin-liaisons">
      <div className="liaisons-header">
        <h1>Gestion des Liaisons</h1>
        <p>Gérez vos secrétaires et demandes de liaison</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "demandes" ? "active" : ""}`}
          onClick={() => setActiveTab("demandes")}
        >
          Nouvelles Demandes
          {demandes.length > 0 && <span className="badge-count">{demandes.length}</span>}
        </button>
        <button
          className={`tab ${activeTab === "historique" ? "active" : ""}`}
          onClick={() => setActiveTab("historique")}
        >
          Historique
        </button>
      </div>

      {/* Contenu des tabs */}
      <div className="tab-content">
        {activeTab === "demandes" && (
          <div className="demandes-section">
            {demandes.length === 0 ? (
              <p className="no-data">Aucune nouvelle demande de liaison</p>
            ) : (
              <div className="liaisons-grid">
                {demandes.map((demande) => (
                  <div key={demande.id} className="liaison-card pending">
                    <div className="liaison-header">
                      <div>
                        <h3>{demande.secretaire.name}</h3>
                        <p className="secretaire-email">{demande.secretaire.email}</p>
                      </div>
                      {getStatutBadge("en_attente")}
                    </div>

                    <div className="liaison-content">
                      {demande.message && (
                        <div className="message-box">
                          <p className="message-label">Message:</p>
                          <p className="message-text">{demande.message}</p>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="label">Date de demande:</span>
                        <span>{new Date(demande.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>

                    <div className="liaison-actions">
                      <button
                        onClick={() => handleAccept(demande.id)}
                        className="btn-accept"
                        disabled={loading}
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRefuse(demande.id)}
                        className="btn-refuse"
                        disabled={loading}
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "historique" && (
          <div className="historique-section">
            {liaisons.length === 0 ? (
              <p className="no-data">Aucune liaison dans l'historique</p>
            ) : (
              <div className="liaisons-grid">
                {liaisons.map((liaison) => (
                  <div key={liaison.id} className="liaison-card">
                    <div className="liaison-header">
                      <div>
                        <h3>{liaison.name}</h3>
                        <p className="secretaire-email">{liaison.email}</p>
                      </div>
                      {getStatutBadge("accepte")}
                    </div>

                    <div className="liaison-content">
                      <div className="info-row">
                        <span className="label">Date de liaison:</span>
                        <span>{new Date(liaison.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>

                    <div className="liaison-actions">
                      <button onClick={() => handleDelete(liaison.id)} className="btn-delete">
                        Supprimer la liaison
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MedecinLiaisons;
