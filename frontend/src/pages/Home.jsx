import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SearchMedecin from './rdv/SearchMedecin';
import Footer from './Footer'
import styles from './rdv/SearchMedecin.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <SearchMedecin />
      <Footer />
    </div>
  );
};

export default Home;