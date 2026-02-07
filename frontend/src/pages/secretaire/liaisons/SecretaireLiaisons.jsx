import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import "./SecretaireLiaisons.css";

function SecretaireLiaisons() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [liaisons, setLiaisons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchLiaisons();
  }, []);

  const fetchLiaisons = async () => {
    try {
      const response = await axiosInstance.get("/secretaire/liaisons");
      setLiaisons(response.data.liaisons);
    } catch (err) {
      console.error("Erreur lors de la récupération des liaisons:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post("/secretaire/liaisons", {
        email,
        message,
      });
      setSuccess(response.data.message);
      setEmail("");
      setMessage("");
      fetchLiaisons();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de la demande");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler cette demande ?")) return;

    try {
      await axiosInstance.delete(`/api/secretaire/liaisons/${id}`);
      setSuccess("Demande annulée avec succès");
      fetchLiaisons();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'annulation");
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
    <div className="secretaire-liaisons">
      <div className="liaisons-header">
        <h1>Gestion des Liaisons</h1>
        <p>Envoyez des demandes de liaison à des médecins</p>
      </div>

      {/* Formulaire d'envoi de demande */}
      <div className="liaison-form-card">
        <h2>Nouvelle Demande de Liaison</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email du Médecin *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@medecin.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message (optionnel)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajoutez un message pour le médecin..."
              rows="4"
              maxLength="500"
            />
            <small>{message.length}/500 caractères</small>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer la Demande"}
          </button>
        </form>
      </div>

      {/* Liste des liaisons */}
      <div className="liaisons-list-card">
        <h2>Mes Demandes de Liaison</h2>
        {liaisons.length === 0 ? (
          <p className="no-data">Aucune demande de liaison pour le moment</p>
        ) : (
          <div className="liaisons-grid">
            {liaisons.map((liaison) => (
              <div key={liaison.id} className="liaison-card">
                <div className="liaison-header">
                  <div>
                    <h3>{liaison.medecin.name}</h3>
                    <p className="medecin-specialite">{liaison.medecin.specialite}</p>
                  </div>
                  {getStatutBadge(liaison.statut)}
                </div>

                <div className="liaison-content">
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span>{liaison.medecin.email}</span>
                  </div>
                  {liaison.medecin.telephone && (
                    <div className="info-row">
                      <span className="label">Téléphone:</span>
                      <span>{liaison.medecin.telephone}</span>
                    </div>
                  )}
                  {liaison.message && (
                    <div className="info-row">
                      <span className="label">Message:</span>
                      <span className="message-text">{liaison.message}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">Date:</span>
                    <span>{new Date(liaison.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>

                {liaison.statut === "en_attente" && (
                  <div className="liaison-actions">
                    <button onClick={() => handleCancel(liaison.id)} className="btn-cancel">
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SecretaireLiaisons;
