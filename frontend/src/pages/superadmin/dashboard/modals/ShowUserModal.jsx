import {
  modalOverlayStyle,
  modalStyle,
  modalHeaderStyle,
  modalBodyStyle,
  modalFooterStyle,
  closeButtonStyle,
  labelStyle,
  valueStyle,
  buttonCloseStyle,
} from "../styles/modalStyles";

const ShowUserModal = ({ isOpen, onClose, userData, loading }) => {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h2>Détails de l'utilisateur</h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>
        <div style={modalBodyStyle}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>Chargement...</div>
          ) : userData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={labelStyle}>ID:</label>
                <p style={valueStyle}>{userData.id}</p>
              </div>
              <div>
                <label style={labelStyle}>Nom:</label>
                <p style={valueStyle}>{userData.name}</p>
              </div>
              <div>
                <label style={labelStyle}>Email:</label>
                <p style={valueStyle}>{userData.email}</p>
              </div>
              <div>
                <label style={labelStyle}>Téléphone:</label>
                <p style={valueStyle}>{userData.phone || "N/A"}</p>
              </div>
              <div>
                <label style={labelStyle}>Adresse:</label>
                <p style={valueStyle}>{userData.address || "N/A"}</p>
              </div>
              <div>
                <label style={labelStyle}>Rôle:</label>
                <p style={valueStyle}>{userData.roles[0]?.name || "Aucun rôle"}</p>
              </div>
            </div>
          ) : (
            <p style={{ color: "#999" }}>Erreur lors du chargement des données</p>
          )}
        </div>
        <div style={modalFooterStyle}>
          <button onClick={onClose} style={buttonCloseStyle}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowUserModal;
