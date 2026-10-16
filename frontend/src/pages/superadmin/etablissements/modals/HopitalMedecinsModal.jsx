import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../../../api/axios";
import { toast } from "react-toastify";
import {
  modalOverlayStyle,
  largeModalStyle,
  modalHeaderStyle,
  modalBodyStyle,
  modalFooterStyle,
  closeButtonStyle,
  buttonCloseStyle,
} from "../../dashboard/styles/modalStyles";

// Liste les médecins d'un établissement afin que le superadmin puisse les réafficher
// individuellement (ou tous d'un coup) après le masquage de l'hôpital.
const HopitalMedecinsModal = ({ hopitalId, hopitalName, onClose, onChanged }) => {
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedecins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/super-admin/etablissements/${hopitalId}/medecins`);
      setMedecins(res.data.medecins || []);
    } catch (error) {
      console.error("Erreur lors du chargement des médecins:", error);
      toast.error("Erreur lors du chargement des médecins");
    } finally {
      setLoading(false);
    }
  }, [hopitalId]);

  useEffect(() => {
    fetchMedecins();
  }, [fetchMedecins]);

  const handleToggleMedecinHide = async (userId, nextVisible) => {
    const nextHide = !nextVisible;
    try {
      await axiosInstance.put(`/super-admin/users/${userId}/hide`, { hide: nextHide });
      setMedecins((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, hide: nextHide } : m))
      );
      toast.success(nextHide ? "Médecin masqué avec succès" : "Médecin réaffiché avec succès");
      onChanged?.();
    } catch (error) {
      console.error("Erreur lors du changement de visibilité:", error);
      toast.error(error.response?.data?.message || "Erreur lors du changement de visibilité");
    }
  };

  const handleUnhideAll = async () => {
    const result = await Swal.fire({
      title: "Réafficher tous les médecins ?",
      text: `Tous les médecins de ${hopitalName} redeviendront visibles dans la recherche publique.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, tout réafficher",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.put(`/super-admin/etablissements/${hopitalId}/medecins/unhide-all`);
      toast.success("Tous les médecins ont été réaffichés");
      await fetchMedecins();
      onChanged?.();
    } catch (error) {
      console.error("Erreur lors du réaffichage:", error);
      toast.error("Erreur lors du réaffichage");
    }
  };

  const hiddenCount = medecins.filter((m) => m.hide).length;

  return (
    <div style={modalOverlayStyle}>
      <div style={largeModalStyle}>
        <div style={modalHeaderStyle}>
          <h2>Médecins de {hopitalName}</h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>
        <div style={modalBodyStyle}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>Chargement...</div>
          ) : medecins.length === 0 ? (
            <p style={{ color: "#999" }}>Aucun médecin rattaché à cet établissement</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Nom</th>
                  <th style={{ padding: "8px" }}>Spécialité</th>
                  <th style={{ padding: "8px" }}>Visible</th>
                </tr>
              </thead>
              <tbody>
                {medecins.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{m.name}</td>
                    <td style={{ padding: "8px" }}>{m.specialite}</td>
                    <td style={{ padding: "8px" }}>
                      <label className="hopital-medecin-switch">
                        <input
                          type="checkbox"
                          checked={!m.hide}
                          onChange={(e) => handleToggleMedecinHide(m.id, e.target.checked)}
                        />
                        <span className="hopital-medecin-slider"></span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <style>{`
            .hopital-medecin-switch {
              position: relative;
              display: inline-block;
              width: 42px;
              height: 24px;
            }
            .hopital-medecin-switch input {
              opacity: 0;
              width: 0;
              height: 0;
            }
            .hopital-medecin-slider {
              position: absolute;
              cursor: pointer;
              inset: 0;
              background-color: #f44336;
              border-radius: 24px;
              transition: background-color 0.2s;
            }
            .hopital-medecin-slider::before {
              content: "";
              position: absolute;
              height: 18px;
              width: 18px;
              left: 3px;
              bottom: 3px;
              background-color: #fff;
              border-radius: 50%;
              transition: transform 0.2s;
            }
            .hopital-medecin-switch input:checked + .hopital-medecin-slider {
              background-color: #4CAF50;
            }
            .hopital-medecin-switch input:checked + .hopital-medecin-slider::before {
              transform: translateX(18px);
            }
          `}</style>
        </div>
        <div style={modalFooterStyle}>
          {hiddenCount > 0 && (
            <button
              onClick={handleUnhideAll}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Réafficher tous ({hiddenCount})
            </button>
          )}
          <button onClick={onClose} style={buttonCloseStyle}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default HopitalMedecinsModal;
