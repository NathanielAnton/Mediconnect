import { useState, useContext, useEffect, useRef } from "react";
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
import PasswordChangeModal from "./PasswordChangeModal";

const CreateUsers = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const tableRef = useRef(null);
  const datatableRef = useRef(null);
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

  // Password Modal state
  const [passwordModal, setPasswordModal] = useState({ open: false, userId: null, userName: null });

  useEffect(() => {
    const initialize = async () => {
      await fetchSpecialites();
      initializeDataTable();
    };
    initialize();

    return () => {
      if (datatableRef.current) {
        try {
          datatableRef.current.DataTable().destroy();
        } catch (e) {
          console.log("DataTables cleanup");
        }
      }
    };
  }, []);

  const fetchSpecialites = async () => {
    try {
      const specialitesRes = await axiosInstance.get("/specialites");
      const specData = Array.isArray(specialitesRes.data)
        ? specialitesRes.data
        : specialitesRes.data.specialites || specialitesRes.data.data || [];

      setSpecialites(specData);
    } catch (error) {
      console.error("Erreur lors du chargement des spécialités:", error);
      toast.error("Erreur lors du chargement des spécialités");
    } finally {
      setLoading(false);
    }
  };

  const initializeDataTable = () => {
    // Attendre que jQuery et DataTables soient disponibles
    const checkAndInitialize = setInterval(() => {
      if (typeof window.$ !== "undefined" && window.$.fn.dataTable && tableRef.current) {
        clearInterval(checkAndInitialize);

        try {
          const $ = window.$;

          // Détruire l'instance existante si elle existe
          if (datatableRef.current) {
            try {
              datatableRef.current.DataTable().destroy();
            } catch (e) {
              console.log("Destroying existing DataTable");
            }
          }

          // Initialiser DataTables
          datatableRef.current = $(tableRef.current).DataTable({
            processing: true,
            serverSide: true,
            autoWidth: false,
            columnDefs: [
              { width: "25%", targets: 0 }, // Nom
              { width: "28%", targets: 1 }, // Email
              { width: "12%", targets: 2 }, // Rôle
              { width: "18%", targets: 3 }, // Date de création
              { width: "8.5%", targets: 4 }, // Modifier
              { width: "8.5%", targets: 5 }, // Mot de passe
            ],
            ajax: function (data, callback, settings) {
              // Construire les paramètres DataTables
              const params = {
                draw: data.draw,
                start: data.start,
                length: data.length,
                "search[value]": data.search.value,
                "order[0][column]": data.order[0].column,
                "order[0][dir]": data.order[0].dir,
              };

              // Utiliser axios pour avoir le token automatiquement
              axiosInstance
                .get(`${import.meta.env.VITE_API_URL}/directeur/personnel-datatable`, { params })
                .then((response) => {
                  console.log("✅ DataTables AJAX Success:", response.data);
                  callback(response.data);
                })
                .catch((error) => {
                  console.error("❌ Erreur DataTables AJAX:", error);
                  console.error("Response:", error.response?.data);
                  toast.error("Erreur lors du chargement des données");
                  callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
                });
            },
            columns: [
              {
                title: "Nom",
                data: "name",
                render: function (data, type, row) {
                  return `
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                        ${data.charAt(0).toUpperCase()}
                      </div>
                      <span>${data}</span>
                    </div>
                  `;
                },
              },
              {
                title: "Email",
                data: "email",
              },
              {
                title: "Rôle",
                data: "role",
                orderable: false,
                render: function (data) {
                  const roleColors = {
                    medecin: "background: rgba(0, 102, 204, 0.1); color: #0066cc;",
                    gestionnaire: "background: rgba(23, 162, 184, 0.1); color: #17a2b8;",
                    secretaire: "background: rgba(111, 66, 193, 0.1); color: #6f42c1;",
                    directeur: "background: rgba(51, 51, 51, 0.1); color: #333;",
                  };
                  const style =
                    roleColors[data.toLowerCase()] ||
                    "background: rgba(128, 128, 128, 0.1); color: #666;";
                  return `<span style="${style} display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize;">${data}</span>`;
                },
              },
              {
                title: "Date de création",
                data: "created_at",
              },
              {
                title: "",
                data: "id",
                orderable: false,
                render: function (data, type, row) {
                  if (row.role.toLowerCase() === "directeur") {
                    return "";
                  }
                  return `<button class="btn-edit-datatable" data-id="${data}" title="Modifier" style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 6px 10px;">✏️</button>`;
                },
              },
              {
                title: "",
                data: "id",
                orderable: false,
                render: function (data, type, row) {
                  if (row.role.toLowerCase() === "directeur") {
                    return "";
                  }
                  return `<button class="btn-password-datatable" data-id="${data}" data-name="${row.name}" title="Changer le mot de passe" style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 6px 10px;">🔐</button>`;
                },
              },
            ],
            pageLength: 10,
            lengthMenu: [10, 25, 50, 100],
            language: {
              url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/fr-FR.json",
            },
            dom:
              "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
              "<'row'<'col-sm-12'tr>>" +
              "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            initComplete: function () {
              console.log("DataTables initialized");
              attachEditHandlers();
            },
            drawCallback: function () {
              attachEditHandlers();
            },
          });

          console.log("DataTable created successfully");
        } catch (error) {
          console.error("Erreur lors de l'initialisation de DataTables:", error);
          toast.error("Erreur lors du chargement du tableau");
        }
      }
    }, 100);

    // Stopper la vérification après 5 secondes
    setTimeout(() => clearInterval(checkAndInitialize), 5000);
  };

  const attachEditHandlers = () => {
    const $ = window.$;
    $(".btn-edit-datatable")
      .off("click")
      .on("click", function () {
        const userId = $(this).data("id");
        handleEditClick(userId);
      });
    $(".btn-password-datatable")
      .off("click")
      .on("click", function () {
        const userId = $(this).data("id");
        const userName = $(this).data("name");
        setPasswordModal({ open: true, userId, userName });
      });
  };

  const handleModalSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);

    // Recharger le DataTable
    if (datatableRef.current && typeof window.$ !== "undefined") {
      try {
        window.$(tableRef.current).DataTable().ajax.reload();
      } catch (e) {
        console.log("Error reloading DataTable");
      }
    }
  };

  const handleEditClick = async (userId) => {
    try {
      const $ = window.$;
      const rows = $(tableRef.current).DataTable().rows().data();

      let userRole = null;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].id === userId) {
          userRole = rows[i].role.toLowerCase();
          break;
        }
      }

      if (!userRole) {
        toast.error("Impossible de déterminer le rôle de l'utilisateur");
        return;
      }

      let endpoint = "";
      if (userRole === "medecin") {
        endpoint = `/directeur/medecins/${userId}`;
      } else if (userRole === "gestionnaire") {
        endpoint = `/directeur/gestionnaires/${userId}`;
      } else if (userRole === "secretaire") {
        endpoint = `/directeur/secretaires/${userId}`;
      } else {
        toast.error("Rôle utilisateur non pris en charge");
        return;
      }

      const response = await axiosInstance.get(endpoint);
      const userData = response.data.user || response.data;

      if (userRole === "medecin") {
        setEditMedecinModal({ open: true, user: userData });
      } else if (userRole === "gestionnaire") {
        setEditGestionnaireModal({ open: true, user: userData });
      } else if (userRole === "secretaire") {
        setEditSecretaireModal({ open: true, user: userData });
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les données de cet utilisateur");
    }
  };

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

        {/* DataTable Container */}
        <div className={styles.tableContainer}>
          <table
            ref={tableRef}
            className={`${styles.usersTable} display`}
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Date de création</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      {/* Create Modals */}
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

      {/* Password Change Modal */}
      {passwordModal.open && (
        <PasswordChangeModal
          userId={passwordModal.userId}
          userName={passwordModal.userName}
          onClose={() => setPasswordModal({ open: false, userId: null, userName: null })}
          onSuccess={() => {
            handleModalSuccess("Mot de passe modifié avec succès");
            setPasswordModal({ open: false, userId: null, userName: null });
          }}
        />
      )}
    </>
  );
};

export default CreateUsers;
