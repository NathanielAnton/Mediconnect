import { useEffect, useState } from "react";
import { HeartPulse, ShieldCheck, Users2 } from "lucide-react";
import api from "/src/api/axios";
import PublicLayout from "./PublicLayout";
import styles from "./PublicPage.module.css";

export default function About() {
  const [stats, setStats] = useState({ medecins: null, hopitaux: null, specialites: null });

  useEffect(() => {
    Promise.all([api.get("/specialites"), api.get("/hopitaux")])
      .then(([specialitesRes, hopitauxRes]) => {
        const specialites = specialitesRes.data.specialites || [];
        const hopitaux = hopitauxRes.data || [];
        const medecins = specialites.reduce(
          (total, s) => total + (s.medecin_profiles_count || 0),
          0
        );
        setStats({ medecins, hopitaux: hopitaux.length, specialites: specialites.length });
      })
      .catch((error) => console.error("Erreur lors du chargement des statistiques:", error));
  }, []);

  return (
    <PublicLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>À propos de MediConnect</h1>
            <p className={styles.heroSubtitle}>
              Faciliter l'accès aux soins en connectant patients et professionnels de santé.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.medecins ?? "—"}</div>
              <div className={styles.statLabel}>Médecins</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.hopitaux ?? "—"}</div>
              <div className={styles.statLabel}>Établissements</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.specialites ?? "—"}</div>
              <div className={styles.statLabel}>Spécialités</div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Notre mission</h2>
          <p className={styles.sectionSubtitle}>
            MediConnect met en relation les patients avec les médecins et établissements de santé
            pour simplifier la prise de rendez-vous, réduire les délais d'attente et améliorer le
            suivi médical au quotidien.
          </p>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIconWrapper}>
                <HeartPulse className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Accès aux soins facilité</h3>
              <p className={styles.cardText}>
                Un accès rapide à un large réseau de médecins et d'établissements partenaires.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIconWrapper}>
                <ShieldCheck className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Données sécurisées</h3>
              <p className={styles.cardText}>
                Vos informations médicales et personnelles sont protégées et traitées avec rigueur.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIconWrapper}>
                <Users2 className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Un écosystème complet</h3>
              <p className={styles.cardText}>
                Patients, médecins, secrétaires et directeurs d'établissement collaborent sur une
                même plateforme.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
