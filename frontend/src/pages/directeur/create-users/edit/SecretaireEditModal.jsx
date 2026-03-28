import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axiosInstance from "../../../../api/axios";
import styles from "./SecretaireEditModal.module.css";

const SecretaireEditModal = ({ isOpen, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user && isOpen) {
      setForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      await axiosInstance.put(`/directeur/secretaires/${user.id}`, {
        name: form.name,
        email: form.email,
      });

      onSuccess("Secrétaire modifiée avec succès!");
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de la modification de la secrétaire");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Modifier Secrétaire</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nom complet *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Marie Dupont"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="secretaire@hopital.fr"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.btnCancel} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "Modification..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecretaireEditModal;
