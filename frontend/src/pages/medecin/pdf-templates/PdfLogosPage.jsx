import { useNavigate } from "react-router-dom";
import NavbarMedecin from "../components/NavbarMedecin";
import PdfImageLibrary from "./PdfImageLibrary";
import styles from "./PdfLogosPage.module.css";

export default function PdfLogosPage() {
  const navigate = useNavigate();

  return (
    <>
      <NavbarMedecin />
      <div className={styles.container}>
        <div className={styles.header}>
          <button type="button" className={styles.backButton} onClick={() => navigate("/medecin/pdf-templates")}>
            Retour aux modèles
          </button>
          <h1 className={styles.title}>Bibliothèque de logos</h1>
        </div>
        <div className={styles.panel}>
          <PdfImageLibrary />
        </div>
      </div>
    </>
  );
}
