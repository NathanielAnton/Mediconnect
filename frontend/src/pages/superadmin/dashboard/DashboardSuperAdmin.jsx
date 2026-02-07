import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
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
        alert("Accès refusé - Réservé aux Super Admins");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert("Veuillez sélectionner un utilisateur et un rôle");
      return;
    }

    try {
      await axiosInstance.post("/super-admin/users/assign-role", {
        user_id: selectedUser,
        role: selectedRole,
      });

      alert("Rôle assigné avec succès");
      fetchDashboardData(); // Recharger les données
      setSelectedUser(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'assignation du rôle");
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
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={styles.badge}>{user.roles[0]?.name || "Aucun rôle"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default DashboardSuperAdmin;
