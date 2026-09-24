import { useEffect, useState } from "react";
import { Building2, MapPin, Phone } from "lucide-react";
import api from "/src/api/axios";
import PublicLayout from "./PublicLayout";
import ModalHopital from "./rdv/components/ModalHopital";
import styles from "./PublicPage.module.css";

export default function Etablissements() {
  const [hopitaux, setHopitaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHopitalId, setLoadingHopitalId] = useState(null);
  const [selectedHopitalDetails, setSelectedHopitalDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api
      .get("/hopitaux")
      .then((res) => setHopitaux(res.data || []))
      .catch((error) => console.error("Erreur lors du chargement des établissements:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleShowHopital = async (hopital) => {
    setLoadingHopitalId(hopital.id);
    try {
      const res = await api.get(`/hopital/${hopital.id}/medecins`);
      setSelectedHopitalDetails(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors du chargement de l'hôpital:", error);
    } finally {
      setLoadingHopitalId(null);
    }
  };

  return (
    <PublicLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Nos établissements</h1>
            <p className={styles.heroSubtitle}>
              Découvrez les hôpitaux et cliniques partenaires de MediConnect.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : hopitaux.length === 0 ? (
            <p className={styles.emptyText}>Aucun établissement disponible pour le moment.</p>
          ) : (
            <div className={styles.grid}>
              {hopitaux.map((hopital) => (
                <div key={hopital.id} className={styles.card}>
                  <div className={styles.cardIconWrapper}>
                    <Building2 className={styles.cardIcon} />
                  </div>
                  <h3 className={styles.cardTitle}>{hopital.name}</h3>
                  {hopital.ville && (
                    <p className={styles.cardText}>
                      <MapPin size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                      {hopital.ville}
                    </p>
                  )}
                  {hopital.telephone && (
                    <p className={styles.cardText}>
                      <Phone size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                      {hopital.telephone}
                    </p>
                  )}
                  {hopital.medecins_count > 0 && (
                    <p className={styles.cardMeta}>
                      {hopital.medecins_count} médecin{hopital.medecins_count > 1 ? "s" : ""}
                    </p>
                  )}
                  <button
                    type="button"
                    className={styles.cardButton}
                    onClick={() => handleShowHopital(hopital)}
                    disabled={loadingHopitalId === hopital.id}
                  >
                    {loadingHopitalId === hopital.id ? "Chargement..." : "Voir les médecins"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showModal && selectedHopitalDetails && (
        <ModalHopital
          hopitalDetails={selectedHopitalDetails}
          onClose={() => {
            setShowModal(false);
            setSelectedHopitalDetails(null);
          }}
        />
      )}
    </PublicLayout>
  );
}
