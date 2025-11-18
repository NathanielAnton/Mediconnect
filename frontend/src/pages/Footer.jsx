import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './rdv/SearchMedecin.module.css';

const Home = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>
          © 2024 MediConnect - Plateforme de prise de rendez-vous médicaux
        </p>
      </div>
    </footer>
  );
};

export default Home;