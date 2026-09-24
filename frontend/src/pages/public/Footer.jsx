import { Link } from "react-router-dom";
import styles from "./rdv/SearchMedecin.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerColumn}>
          <h3 className={styles.footerColumnTitle}>Navigation</h3>
          <Link to="/" className={styles.footerLink}>Accueil</Link>
          <Link to="/comment-ca-marche" className={styles.footerLink}>Comment ça marche</Link>
          <Link to="/specialites" className={styles.footerLink}>Spécialités</Link>
          <Link to="/etablissements" className={styles.footerLink}>Établissements</Link>
          <Link to="/a-propos" className={styles.footerLink}>À propos</Link>
          <Link to="/faq" className={styles.footerLink}>FAQ</Link>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerColumnTitle}>Compte</h3>
          <Link to="/login" className={styles.footerLink}>Se connecter</Link>
          <Link to="/register" className={styles.footerLink}>S'inscrire</Link>
          <Link to="/professionnels-de-sante" className={styles.footerLink}>Professionnels de santé</Link>
          <Link to="/demande-directeur" className={styles.footerLink}>Devenir directeur</Link>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerColumnTitle}>Contact</h3>
          <a href="mailto:contact@mediconnect.fr" className={styles.footerLink}>contact@mediconnect.fr</a>
          <a href="tel:+212500000000" className={styles.footerLink}>+212 5 00 00 00 00</a>
          <Link to="/contact" className={styles.footerLink}>Nous contacter</Link>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerText}>
          © 2024 MediConnect - Plateforme de prise de rendez-vous médicaux
        </p>
      </div>
    </footer>
  );
};

export default Footer;