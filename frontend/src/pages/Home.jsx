import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SearchMedecin from './SearchMedecin';
import styles from '../SearchMedecin.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <SearchMedecin />
    </div>
  );
};

export default Home;