import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../api/axios";
import styles from "./PasswordChangeModal.module.css";

const PasswordChangeModal = ({ userId, userName, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit avoir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put(`/directeur/users/${userId}/password`, {
        password,
      });

      toast.success("Mot de passe modifié avec succès");
      onSuccess();
    } catch (error) {
      console.error("Erreur:", error);
      const errorMsg = error.response?.data?.message || "Erreur lors de la modification du mot de passe";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Changer le mot de passe</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.userInfo}>Utilisateur: <strong>{userName}</strong></p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le mot de passe"
                disabled={loading}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={onClose}
                className={styles.btnCancel}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? "Modification en cours..." : "Changer le mot de passe"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
