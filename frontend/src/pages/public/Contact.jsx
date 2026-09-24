import { Mail, Phone, MapPin } from "lucide-react";
import PublicLayout from "./PublicLayout";
import styles from "./PublicPage.module.css";

export default function Contact() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Contactez-nous</h1>
            <p className={styles.heroSubtitle}>
              Une question ? Notre équipe est à votre écoute.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <div className={styles.cardIconWrapper}>
                <Mail className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Email</h3>
              <a href="mailto:contact@mediconnect.fr" className={styles.contactLink}>
                contact@mediconnect.fr
              </a>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.cardIconWrapper}>
                <Phone className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Téléphone</h3>
              <a href="tel:+212500000000" className={styles.contactLink}>
                +212 5 00 00 00 00
              </a>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.cardIconWrapper}>
                <MapPin className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>Adresse</h3>
              <p className={styles.cardText}>À compléter</p>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
