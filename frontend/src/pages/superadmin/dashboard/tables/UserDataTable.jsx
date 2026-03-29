import { useState, useMemo } from "react";
import { Eye, Pencil, Key } from "react-bootstrap-icons";
import axiosInstance from "../../../../api/axios";
import { toast } from "react-toastify";
import ShowUserModal from "../modals/ShowUserModal";
import EditUserModal from "../modals/EditUserModal";
import ChangePasswordModal from "../modals/ChangePasswordModal";

const UserDataTable = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
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

  const handleChangePasswordUser = async (userId) => {
    const userData = await fetchUserDetails(userId);
    if (userData) {
      setSelectedUserData(userData);
      setChangePasswordModal(true);
    }
  };

  const handleFormChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
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
                    <button
                      onClick={() => handleChangePasswordUser(user.id)}
                      title="Changer le mot de passe"
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#ff9800",
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
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#e68a00")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ff9800")}
                    >
                      <Key size={18} />
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

      {/* Modals */}
      <ShowUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userData={selectedUserData}
        loading={loadingModal}
      />

      <EditUserModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        formData={editFormData}
        onFormChange={handleFormChange}
        onSave={handleUpdateUser}
        loading={loadingModal}
      />

      {changePasswordModal && selectedUserData && (
        <ChangePasswordModal
          user={selectedUserData}
          onClose={() => {
            setChangePasswordModal(false);
            setSelectedUserData(null);
          }}
          onSuccess={() => {
            // Recharger les données si nécessaire
          }}
        />
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

const cellStyle = {
  padding: "12px 15px",
  textAlign: "left",
  fontSize: "14px",
  borderRight: "1px solid #eee",
};

export default UserDataTable;
