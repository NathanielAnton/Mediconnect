import {
  modalOverlayStyle,
  modalStyle,
  modalHeaderStyle,
  modalBodyStyle,
  modalFooterStyle,
  closeButtonStyle,
  labelStyle,
  inputStyle,
  buttonCloseStyle,
  buttonSaveStyle,
} from "../styles/modalStyles";

const EditUserModal = ({ isOpen, onClose, formData, onFormChange, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h2>Éditer l'utilisateur</h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>
        <div style={modalBodyStyle}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>Chargement...</div>
          ) : formData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={labelStyle}>Nom:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onFormChange("name", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormChange("email", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Téléphone:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => onFormChange("phone", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Adresse:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => onFormChange("address", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          ) : (
            <p style={{ color: "#999" }}>Erreur lors du chargement des données</p>
          )}
        </div>
        <div style={modalFooterStyle}>
          <button onClick={onClose} style={buttonCloseStyle}>
            Annuler
          </button>
          <button onClick={onSave} style={buttonSaveStyle}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
