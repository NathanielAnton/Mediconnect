// Styles pour les modals
export const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

export const modalStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  overflow: "hidden",
};

export const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #eee",
  backgroundColor: "#f5f5f5",
};

export const modalBodyStyle = {
  flex: 1,
  padding: "20px",
  overflowY: "auto",
};

export const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  padding: "20px",
  borderTop: "1px solid #eee",
  backgroundColor: "#f5f5f5",
};

export const closeButtonStyle = {
  backgroundColor: "transparent",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  color: "#666",
  padding: 0,
  width: "30px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color 0.2s",
};

export const labelStyle = {
  fontWeight: "600",
  color: "#333",
  marginBottom: "5px",
  display: "block",
};

export const valueStyle = {
  color: "#666",
  margin: "0",
  padding: "8px 12px",
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
};

export const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

export const buttonCloseStyle = {
  padding: "8px 16px",
  backgroundColor: "#e0e0e0",
  color: "#333",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "500",
  transition: "background-color 0.2s",
};

export const buttonSaveStyle = {
  padding: "8px 16px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "500",
  transition: "background-color 0.2s",
};
