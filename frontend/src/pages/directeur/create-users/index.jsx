import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../../context/AuthContext";
import axiosInstance from "../../../api/axios";
import styles from "./CreateUsers.module.css";
import { User, Users, UserCheck } from "lucide-react";
import DirectorNavbar from "../utils/navbar";
import MedecinModal from "./create/MedecinModal";
import GestionnaireModal from "./create/GestionnaireModal";
import SecretaireModal from "./create/SecretaireModal";
import MedecinEditModal from "./edit/MedecinEditModal";
import GestionnaireEditModal from "./edit/GestionnaireEditModal";
import SecretaireEditModal from "./edit/SecretaireEditModal";

const CreateUsers = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Create Modal states
  const [medecinModalOpen, setMedecinModalOpen] = useState(false);
  const [gestionnaireModalOpen, setGestionnaireModalOpen] = useState(false);
  const [secretaireModalOpen, setSecretaireModalOpen] = useState(false);

  // Edit Modal states
  const [editMedecinModal, setEditMedecinModal] = useState({ open: false, user: null });
  const [editGestionnaireModal, setEditGestionnaireModal] = useState({ open: false, user: null });
  const [editSecretaireModal, setEditSecretaireModal] = useState({ open: false, user: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, specialitesRes] = await Promise.all([
        axiosInstance.get("/directeur/users"),
        axiosInstance.get("/specialites"),
      ]);

      setUsers(usersRes.data.users || []);

      // Extraire les spécialités - elles peuvent être dans data.specialites ou directement dans data
      const specData = Array.isArray(specialitesRes.data)
        ? specialitesRes.data
        : specialitesRes.data.specialites || specialitesRes.data.data || [];

      console.log("Spécialités chargées:", specData);
      setSpecialites(specData);

      if (!specData || specData.length === 0) {
        console.warn("Aucune spécialité reçue de l'API!");
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      if (error.response?.status === 403) {
        toast.error("Accès refusé");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
    fetchData(); // Recharger les utilisateurs
  };

  const handleEditClick = async (userId) => {
    try {
      // Chercher l'utilisateur dans le state pour obtenir le rôle
      const userFromState = users.find((u) => u.id === userId);

      if (!userFromState) {
        console.error("Utilisateur non trouvé");
        toast.error("Utilisateur non trouvé");
        return;
      }

      // Récupérer le rôle
      const userRole = userFromState.roles?.[0]?.name || userFromState.roles?.[0];

      if (!userRole) {
        console.error("Rôle non disponible");
        toast.error("Impossible de déterminer le rôle de l'utilisateur");
        return;
      }

      const role = userRole.toLowerCase();
      let endpoint = "";

      // Construire l'endpoint approprié
      if (role === "medecin") {
        endpoint = `/directeur/medecins/${userId}`;
      } else if (role === "gestionnaire") {
        endpoint = `/directeur/gestionnaires/${userId}`;
      } else if (role === "secretaire") {
        endpoint = `/directeur/secretaires/${userId}`;
      } else {
        console.error("Rôle non pris en charge:", role);
        toast.error("Rôle utilisateur non pris en charge");
        return;
      }

      console.log("Chargement des données depuis:", endpoint);

      // Charger les données complètes du backend
      const response = await axiosInstance.get(endpoint);
      const userData = response.data.user || response.data;

      console.log("Données chargées:", userData);

      // Ouvrir le modal approprié avec les données chargées
      if (role === "medecin") {
        setEditMedecinModal({ open: true, user: userData });
      } else if (role === "gestionnaire") {
        setEditGestionnaireModal({ open: true, user: userData });
      } else if (role === "secretaire") {
        setEditSecretaireModal({ open: true, user: userData });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Impossible de charger les données de cet utilisateur");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <>
      <DirectorNavbar />
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestion du Personnel</h1>
            <p className={styles.subtitle}>
              Créez et gérez les médecins, gestionnaires et secrétaires de votre hôpital
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>
            <span>✓</span> {successMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            onClick={() => setMedecinModalOpen(true)}
            className={`${styles.actionBtn} ${styles.btnMedecin}`}
          >
            <User size={20} />
            <span>Ajouter un Médecin</span>
          </button>
          <button
            onClick={() => setGestionnaireModalOpen(true)}
            className={`${styles.actionBtn} ${styles.btnGestionnaire}`}
          >
            <Users size={20} />
            <span>Ajouter un Gestionnaire</span>
          </button>
          <button
            onClick={() => setSecretaireModalOpen(true)}
            className={`${styles.actionBtn} ${styles.btnSecretaire}`}
          >
            <UserCheck size={20} />
            <span>Ajouter une Secrétaire</span>
          </button>
        </div>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Personnel de l'Hôpital</h2>
            <span className={styles.userCount}>{users.length} utilisateurs</span>
          </div>

          {users.length > 0 ? (
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.nameCell}>
                      <div className={styles.nameContent}>
                        <div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div>
                        <span className={styles.name}>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${styles[`badge-${u.roles[0]?.name || "user"}`.toLowerCase()]}`}
                      >
                        {u.roles[0]?.name || "User"}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className={styles.actionsCell}>
                      {u.roles[0]?.name?.toLowerCase() !== "directeur" && (
                        <button
                          onClick={() => handleEditClick(u.id)}
                          className={styles.btnEdit}
                          title="Modifier"
                          data-id={u.id}
                        >
                          ✏️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <Users size={48} />
              <p>Aucun utilisateur pour le moment</p>
              <span>Commencez en ajoutant un médecin, gestionnaire ou secrétaire</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Modals */}
      {console.log("Passing specialites to MedecinModal:", specialites)}
      <MedecinModal
        isOpen={medecinModalOpen}
        onClose={() => setMedecinModalOpen(false)}
        onSuccess={handleModalSuccess}
        specialites={specialites}
      />
      <GestionnaireModal
        isOpen={gestionnaireModalOpen}
        onClose={() => setGestionnaireModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      <SecretaireModal
        isOpen={secretaireModalOpen}
        onClose={() => setSecretaireModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Modals */}
      <MedecinEditModal
        isOpen={editMedecinModal.open}
        user={editMedecinModal.user}
        onClose={() => setEditMedecinModal({ open: false, user: null })}
        onSuccess={handleModalSuccess}
        specialites={specialites}
      />
      <GestionnaireEditModal
        isOpen={editGestionnaireModal.open}
        user={editGestionnaireModal.user}
        onClose={() => setEditGestionnaireModal({ open: false, user: null })}
        onSuccess={handleModalSuccess}
      />
      <SecretaireEditModal
        isOpen={editSecretaireModal.open}
        user={editSecretaireModal.user}
        onClose={() => setEditSecretaireModal({ open: false, user: null })}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default CreateUsers;
