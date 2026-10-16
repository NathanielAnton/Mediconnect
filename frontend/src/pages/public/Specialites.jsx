import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import api from "/src/api/axios";
import PublicLayout from "./PublicLayout";
import styles from "./PublicPage.module.css";

export default function Specialites() {
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/specialites")
      .then((res) => setSpecialites(res.data.specialites || []))
      .catch((error) => console.error("Erreur lors du chargement des spécialités:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (nom) => {
    navigate(`/?query=${encodeURIComponent(nom)}`);
  };

  return (
    <PublicLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Nos spécialités</h1>
            <p className={styles.heroSubtitle}>
              Parcourez nos spécialités médicales et trouvez le bon praticien.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : specialites.length === 0 ? (
            <p className={styles.emptyText}>Aucune spécialité disponible pour le moment.</p>
          ) : (
            <div className={styles.grid}>
              {specialites.map((specialite) => (
                <button
                  key={specialite.id}
                  type="button"
                  className={styles.card}
                  onClick={() => handleSelect(specialite.nom)}
                  style={{ border: "none", cursor: "pointer" }}
                >
                  <div className={styles.cardIconWrapper}>
                    <Stethoscope className={styles.cardIcon} />
                  </div>
                  <h3 className={styles.cardTitle}>{specialite.nom}</h3>
                  {typeof specialite.medecin_profiles_count === "number" && (
                    <p className={styles.cardMeta}>
                      {specialite.medecin_profiles_count} médecin
                      {specialite.medecin_profiles_count > 1 ? "s" : ""}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
