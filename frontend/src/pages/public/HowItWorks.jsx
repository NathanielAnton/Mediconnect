import { Link } from "react-router-dom";
import { Search, CalendarCheck, CheckCircle2, Bell } from "lucide-react";
import PublicLayout from "./PublicLayout";
import styles from "./PublicPage.module.css";

const STEPS = [
  {
    icon: Search,
    title: "1. Recherchez un médecin",
    description:
      "Trouvez le professionnel de santé qu'il vous faut par nom, spécialité, établissement ou ville.",
  },
  {
    icon: CalendarCheck,
    title: "2. Choisissez un créneau",
    description:
      "Consultez les horaires disponibles du médecin et sélectionnez le créneau qui vous convient.",
  },
  {
    icon: CheckCircle2,
    title: "3. Confirmez votre rendez-vous",
    description: "Renseignez vos informations et confirmez votre demande de rendez-vous en quelques clics.",
  },
  {
    icon: Bell,
    title: "4. Suivez votre RDV",
    description:
      "Retrouvez tous vos rendez-vous à venir depuis votre espace personnel et recevez vos rappels.",
  },
];

export default function HowItWorks() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Comment ça marche ?</h1>
            <p className={styles.heroSubtitle}>
              Prendre rendez-vous avec un médecin n'a jamais été aussi simple.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.grid}>
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className={styles.card}>
                  <div className={styles.cardIconWrapper}>
                    <Icon className={styles.cardIcon} />
                  </div>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardText}>{step.description}</p>
                </div>
              );
            })}
          </div>

          <div className={styles.ctaRow}>
            <Link to="/" className={styles.ctaPrimary}>
              Rechercher un médecin
            </Link>
            <Link to="/register" className={styles.ctaSecondary}>
              Créer un compte
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
