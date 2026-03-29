import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "./Navbar";
import SearchMedecin from "./rdv/SearchMedecin";
import Footer from "./Footer";
import styles from "./rdv/SearchMedecin.module.css";

const Home = () => {
  const { checkAuth } = useContext(AuthContext);

  useEffect(() => {
    // Mettre à jour l'état d'authentification une seule fois au montage
    checkAuth();
  }, []);

  return (
    <div className={styles.container}>
      <Navbar />
      <SearchMedecin />
      <Footer />
    </div>
  );
};

export default Home;
