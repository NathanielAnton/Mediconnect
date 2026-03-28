import { useState } from "react";
import { X } from "lucide-react";
import axiosInstance from "../../../../api/axios";
import styles from "./SecretaireModal.module.css";

const SecretaireModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/directeur/create-secretaire", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      onSuccess("Secrétaire créée avec succès!");
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de la création de la secrétaire");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Ajouter une Secrétaire</h2>
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

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Mot de passe *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Confirmer mot de passe *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.btnCancel} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "Création..." : "Créer Secrétaire"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecretaireModal;
