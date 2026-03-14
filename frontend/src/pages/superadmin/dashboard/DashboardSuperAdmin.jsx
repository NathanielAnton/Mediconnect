import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { Eye, Pencil } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import styles from "./DashboardSuperAdmin.module.css";

const DashboardSuperAdmin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, usersRes, rolesRes] = await Promise.all([
        axiosInstance.get("/super-admin/dashboard"),
        axiosInstance.get("/super-admin/users"),
        axiosInstance.get("/super-admin/roles"),
      ]);

      setStats(dashboardRes.data.stats);
      setUsers(usersRes.data.users);
      setRoles(rolesRes.data.roles);
    } catch (error) {
      console.error("Erreur:", error);
      if (error.response?.status === 403) {
        toast.error("Accès refusé - Réservé aux Super Admins");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.warning("Veuillez sélectionner un utilisateur et un rôle");
      return;
    }

    try {
      await axiosInstance.post("/super-admin/users/assign-role", {
        user_id: selectedUser,
        role: selectedRole,
      });

      toast.success("Rôle assigné avec succès");
      fetchDashboardData(); // Recharger les données
      setSelectedUser(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'assignation du rôle");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔐 Super Admin Dashboard</h1>
        <button onClick={() => navigate("/")} className={styles.btnBack}>
          Retour
        </button>
      </div>

      {/* Statistiques */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Utilisateurs</h3>
          <p className={styles.statNumber}>{stats?.total_users || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Rôles</h3>
          <p className={styles.statNumber}>{stats?.total_roles || 0}</p>
        </div>
      </div>

      {/* Gestion des rôles */}
      <div className={styles.section}>
        <h2>Assigner un rôle</h2>
        <div className={styles.assignForm}>
          <select
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(e.target.value)}
            className={styles.select}
          >
            <option value="">Sélectionner un utilisateur</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email}) - Rôle actuel: {user.roles[0]?.name || "Aucun"}
              </option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={styles.select}
          >
            <option value="">Sélectionner un rôle</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name} ({role.users_count} utilisateurs)
              </option>
            ))}
          </select>

          <button onClick={handleAssignRole} className={styles.btnAssign}>
            Assigner le rôle
          </button>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className={styles.section}>
        <h2>Tous les utilisateurs</h2>
        <UserDataTable users={users} />
      </div>

      {/* Liste des rôles */}
      <div className={styles.section}>
        <h2>Tous les rôles</h2>
        <div className={styles.rolesGrid}>
          {roles.map((role) => (
            <div key={role.id} className={styles.roleCard}>
              <h3>{role.name}</h3>
              <p>{role.users_count} utilisateur(s)</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant DataTable personnalisé pour les utilisateurs
const UserDataTable = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const itemsPerPage = 10;

  // Récupérer les détails d'un utilisateur via API
  const fetchUserDetails = async (userId) => {
    setLoadingModal(true);
    try {
      const response = await axiosInstance.get(`/super-admin/users/${userId}`);
      setSelectedUserData(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      toast.error("Erreur lors de la récupération des données");
      return null;
    } finally {
      setLoadingModal(false);
    }
  };

  const handleShowUser = async (userId) => {
    const userData = await fetchUserDetails(userId);
    if (userData) {
      setShowModal(true);
    }
  };

  const handleEditUser = async (userId) => {
    const userData = await fetchUserDetails(userId);
    if (userData) {
      setEditFormData({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
      });
      setEditModal(true);
    }
  };

  const handleUpdateUser = async () => {
    if (!editFormData) return;

    try {
      await axiosInstance.put(`/super-admin/users/${editFormData.id}`, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
      });
      toast.success("Utilisateur mis à jour avec succès");
      setEditModal(false);
      setEditFormData(null);
      // Recharger la liste serait idéal ici
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(user.id).includes(searchTerm)
    );
  }, [users, searchTerm]);

  // Trier les utilisateurs
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "role") {
        aValue = a.roles[0]?.name || "Aucun rôle";
        bValue = b.roles[0]?.name || "Aucun rôle";
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortConfig]);

  // Paginer les utilisateurs
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return " ⇅";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher par nom, email ou ID..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        style={{
          padding: "10px 15px",
          fontSize: "14px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          width: "100%",
          boxSizing: "border-box",
        }}
      />

      {/* Tableau */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th onClick={() => handleSort("id")} style={headerCellStyle}>
                ID{SortIcon({ column: "id" })}
              </th>
              <th onClick={() => handleSort("name")} style={headerCellStyle}>
                Nom{SortIcon({ column: "name" })}
              </th>
              <th onClick={() => handleSort("email")} style={headerCellStyle}>
                Email{SortIcon({ column: "email" })}
              </th>
              <th onClick={() => handleSort("role")} style={headerCellStyle}>
                Rôle{SortIcon({ column: "role" })}
              </th>
              <th style={{ ...headerCellStyle, cursor: "default" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafafa",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "#ffffff" : "#fafafa")
                  }
                >
                  <td style={cellStyle}>{user.id}</td>
                  <td style={cellStyle}>{user.name}</td>
                  <td style={cellStyle}>{user.email}</td>
                  <td style={cellStyle}>
                    <span
                      style={{
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "0.85em",
                        fontWeight: "500",
                      }}
                    >
                      {user.roles[0]?.name || "Aucun rôle"}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleShowUser(user.id)}
                      title="Voir les détails"
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditUser(user.id)}
                      title="Éditer l'utilisateur"
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#0b7dda")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#2196F3")}
                    >
                      <Pencil size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "15px",
        }}
      >
        <div style={{ fontSize: "14px", color: "#666" }}>
          Affichage {startIndex + 1} à {Math.min(startIndex + itemsPerPage, sortedUsers.length)} sur{" "}
          {sortedUsers.length} utilisateurs
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: currentPage === 1 ? "#f0f0f0" : "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ← Précédent
          </button>

          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: currentPage === page ? "#1976d2" : "#fff",
                  color: currentPage === page ? "#fff" : "#000",
                  cursor: "pointer",
                  fontWeight: currentPage === page ? "600" : "normal",
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: currentPage === totalPages ? "#f0f0f0" : "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* Modal Show User */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h2>Détails de l'utilisateur</h2>
              <button onClick={() => setShowModal(false)} style={closeButtonStyle}>
                ✕
              </button>
            </div>
            <div style={modalBodyStyle}>
              {loadingModal ? (
                <div style={{ textAlign: "center", padding: "20px" }}>Chargement...</div>
              ) : selectedUserData ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={labelStyle}>ID:</label>
                    <p style={valueStyle}>{selectedUserData.id}</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Nom:</label>
                    <p style={valueStyle}>{selectedUserData.name}</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Email:</label>
                    <p style={valueStyle}>{selectedUserData.email}</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Téléphone:</label>
                    <p style={valueStyle}>{selectedUserData.phone || "N/A"}</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Adresse:</label>
                    <p style={valueStyle}>{selectedUserData.address || "N/A"}</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Rôle:</label>
                    <p style={valueStyle}>{selectedUserData.roles[0]?.name || "Aucun rôle"}</p>
                  </div>
                </div>
              ) : (
                <p style={{ color: "#999" }}>Erreur lors du chargement des données</p>
              )}
            </div>
            <div style={modalFooterStyle}>
              <button onClick={() => setShowModal(false)} style={buttonCloseStyle}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {editModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h2>Éditer l'utilisateur</h2>
              <button onClick={() => setEditModal(false)} style={closeButtonStyle}>
                ✕
              </button>
            </div>
            <div style={modalBodyStyle}>
              {loadingModal ? (
                <div style={{ textAlign: "center", padding: "20px" }}>Chargement...</div>
              ) : editFormData ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={labelStyle}>Nom:</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email:</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Téléphone:</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Adresse:</label>
                    <input
                      type="text"
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, address: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
              ) : (
                <p style={{ color: "#999" }}>Erreur lors du chargement des données</p>
              )}
            </div>
            <div style={modalFooterStyle}>
              <button onClick={() => setEditModal(false)} style={buttonCloseStyle}>
                Annuler
              </button>
              <button onClick={handleUpdateUser} style={buttonSaveStyle}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const headerCellStyle = {
  padding: "12px 15px",
  textAlign: "left",
  fontWeight: "600",
  cursor: "pointer",
  userSelect: "none",
  transition: "background-color 0.2s",
  borderRight: "1px solid #ddd",
};

headerCellStyle[":hover"] = {
  backgroundColor: "#efefef",
};

const cellStyle = {
  padding: "12px 15px",
  textAlign: "left",
  fontSize: "14px",
  borderRight: "1px solid #eee",
};

// Styles pour les modals
const modalOverlayStyle = {
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

const modalStyle = {
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

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #eee",
  backgroundColor: "#f5f5f5",
};

const modalBodyStyle = {
  flex: 1,
  padding: "20px",
  overflowY: "auto",
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  padding: "20px",
  borderTop: "1px solid #eee",
  backgroundColor: "#f5f5f5",
};

const closeButtonStyle = {
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

const labelStyle = {
  fontWeight: "600",
  color: "#333",
  marginBottom: "5px",
  display: "block",
};

const valueStyle = {
  color: "#666",
  margin: "0",
  padding: "8px 12px",
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const buttonCloseStyle = {
  padding: "8px 16px",
  backgroundColor: "#e0e0e0",
  color: "#333",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "500",
  transition: "background-color 0.2s",
};

const buttonSaveStyle = {
  padding: "8px 16px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "500",
  transition: "background-color 0.2s",
};

export default DashboardSuperAdmin;
