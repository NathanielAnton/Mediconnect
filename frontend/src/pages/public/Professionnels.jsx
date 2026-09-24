import { Link } from "react-router-dom";
import { Stethoscope, Building, Users, TrendingUp } from "lucide-react";
import PublicLayout from "./PublicLayout";
import styles from "./PublicPage.module.css";

const BENEFITS = [
  {
    icon: Users,
    title: "Plus de patients",
    description: "Soyez visible auprès de patients qui recherchent activement un médecin près de chez eux.",
  },
  {
    icon: TrendingUp,
    title: "Gestion simplifiée",
    description: "Gérez vos horaires, vos disponibilités et vos rendez-vous depuis un espace dédié.",
  },
  {
    icon: Building,
    title: "Établissements multi-sites",
    description: "Gérez plusieurs médecins et secrétaires au sein d'un même hôpital ou cabinet.",
  },
];

export default function Professionnels() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Pour les professionnels de santé</h1>
            <p className={styles.heroSubtitle}>
              Rejoignez MediConnect et simplifiez la gestion de vos rendez-vous.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.grid}>
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className={styles.card}>
                  <div className={styles.cardIconWrapper}>
                    <Icon className={styles.cardIcon} />
                  </div>
                  <h3 className={styles.cardTitle}>{benefit.title}</h3>
                  <p className={styles.cardText}>{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <h2 className={styles.sectionTitle}>Vous êtes...</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIconWrapper}>
                <Building className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Directeur d'établissement</h3>
              <p className={styles.cardText}>
                Inscrivez votre hôpital ou clinique et gérez vos médecins et secrétaires.
              </p>
              <Link to="/demande-directeur" className={styles.ctaPrimary} style={{ display: "inline-block", marginTop: "1rem" }}>
                Demande directeur
              </Link>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIconWrapper}>
                <Stethoscope className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Médecin ou secrétaire</h3>
              <p className={styles.cardText}>
                Votre compte est créé par le directeur de votre établissement depuis son espace de gestion.
              </p>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <Link to="/register" className={styles.ctaPrimary}>
              Créer un compte
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
