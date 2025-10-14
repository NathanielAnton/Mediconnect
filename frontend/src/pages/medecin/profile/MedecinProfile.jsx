import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";
import NavbarMedecin from "../components/NavbarMedecin";
import styles from './MedecinProfile.module.css';

export default function MedecinProfile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Charger le profil au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/medecin/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/medecin/profile", profile);
      setMessage("✅ Profil mis à jour avec succès !");
      setMessageType("success");
      // Masquer le message après 5 secondes
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setMessage("❌ Erreur de mise à jour");
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <NavbarMedecin />
        <div className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <NavbarMedecin />
        <div className={styles.mainContent}>
          <div className={styles.errorContainer}>
            <h3 className={styles.errorTitle}>Profil introuvable</h3>
            <p className={styles.errorMessage}>Nous n'avons pas pu charger votre profil. Veuillez réessayer.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Utilisation du composant Navbar */}
      <NavbarMedecin />
      
      <div className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mon Profil Médecin</h1>
          <p className={styles.pageSubtitle}>Gérez vos informations professionnelles</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`${styles.messageContainer} ${messageType === "success" ? styles.messageSuccess : styles.messageError}`}>
            {message}
          </div>
        )}

        {/* Info Section */}
        <div className={styles.infoSection}>
          💡 Mettez à jour vos informations professionnelles pour aider les patients à vous trouver facilement.
        </div>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          <h2 className={styles.profileCardTitle}>
            📋 Informations Professionnelles
          </h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              {/* Specialité */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Spécialité</label>
                <input
                  type="text"
                  name="specialite"
                  value={profile.specialite || ""}
                  onChange={handleChange}
                  placeholder="Ex: Cardiologue, Dermatologue..."
                  className={styles.formInput}
                />
              </div>

              {/* Telephone */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={profile.telephone || ""}
                  onChange={handleChange}
                  placeholder="Ex: +33 6 12 34 56 78"
                  className={styles.formInput}
                />
              </div>

              {/* Description */}
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <label className={styles.formLabel}>Description Professionnelle</label>
                <textarea
                  name="description"
                  value={profile.description || ""}
                  onChange={handleChange}
                  placeholder="Présentez votre expérience et vos compétences..."
                  className={styles.formTextarea}
                />
              </div>

              {/* Adresse */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={profile.adresse || ""}
                  onChange={handleChange}
                  placeholder="Ex: 123 Rue de la Paix"
                  className={styles.formInput}
                />
              </div>

              {/* Ville */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ville</label>
                <input
                  type="text"
                  name="ville"
                  value={profile.ville || ""}
                  onChange={handleChange}
                  placeholder="Ex: Paris"
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Button Container */}
            <div className={styles.buttonContainer}>
              <button
                type="submit"
                className={styles.submitButton}
              >
                Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}