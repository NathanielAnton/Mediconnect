import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavbarMedecin from "../components/NavbarMedecin";
import styles from "./DashboardMedecin.module.css";
import MedecinLiaisons from "../liaisons/MedecinLiaisons";

const DashboardMedecin = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={styles.container}>
      {/* Utilisation du composant Navbar */}
      <NavbarMedecin />

      {/* Contenu principal */}
      <main className={styles.main}>
        <MedecinLiaisons />
      </main>
    </div>
  );
};

export default DashboardMedecin;
