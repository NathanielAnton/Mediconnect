import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import NavbarMedecin from "../components/NavbarMedecin";
import { pdfApi } from "../../../api/pdfApi";
import { createBlankLayout } from "../../../utils/pdf/layout";
import styles from "./PdfTemplatesList.module.css";

const TYPE_LABELS = { ordonnance: "Ordonnance", facture: "Facture" };

export default function PdfTemplatesList() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("ordonnance");
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setTemplates(await pdfApi.listTemplates(filterType));
    } catch {
      toast.error("Impossible de charger les modèles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [filterType]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newName.trim()) return;

    try {
      setSaving(true);
      const template = await pdfApi.createTemplate({
        nom: newName.trim(),
        type: newType,
        format: "A4",
        layout: createBlankLayout(),
      });
      navigate(`/medecin/pdf-templates/${template.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Création impossible");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template) => {
    const result = await Swal.fire({
      title: "Supprimer ce modèle ?",
      text: "Les documents déjà archivés restent disponibles.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;

    try {
      await pdfApi.deleteTemplate(template.id);
      toast.success("Modèle supprimé");
      loadTemplates();
    } catch {
      toast.error("Suppression impossible");
    }
  };

  return (
    <>
      <NavbarMedecin />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Modèles de documents</h1>
            <p className={styles.subtitle}>Ordonnances et factures personnalisées</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.secondaryButton} onClick={() => navigate("/medecin/pdf-templates/logos")}>
              Bibliothèque de logos
            </button>
            <button className={styles.primaryButton} onClick={() => setShowCreate(true)}>
              Nouveau modèle
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={styles.select}>
            <option value="">Tous les types</option>
            <option value="ordonnance">Ordonnances</option>
            <option value="facture">Factures</option>
          </select>
        </div>

        {loading ? (
          <p className={styles.empty}>Chargement...</p>
        ) : templates.length === 0 ? (
          <p className={styles.empty}>Aucun modèle. Créez votre premier modèle.</p>
        ) : (
          <div className={styles.grid}>
            {templates.map((template) => (
              <div key={template.id} className={styles.card}>
                <span className={`${styles.badge} ${styles[template.type]}`}>{TYPE_LABELS[template.type]}</span>
                <h3 className={styles.cardTitle}>{template.nom}</h3>
                <p className={styles.meta}>
                  Format {template.format} - modifié le {new Date(template.updated_at).toLocaleDateString("fr-FR")}
                </p>
                <div className={styles.cardActions}>
                  <button className={styles.secondaryButton} onClick={() => navigate(`/medecin/pdf-templates/${template.id}`)}>
                    Modifier
                  </button>
                  <button className={styles.dangerButton} onClick={() => handleDelete(template)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className={styles.overlay} onClick={() => setShowCreate(false)}>
          <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h2 className={styles.modalTitle}>Nouveau modèle</h2>
            <label className={styles.label}>
              Nom du modèle
              <input
                className={styles.input}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={255}
                required
              />
            </label>
            <label className={styles.label}>
              Type de document
              <select className={styles.input} value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="ordonnance">Ordonnance</option>
                <option value="facture">Facture</option>
              </select>
            </label>
            <div className={styles.cardActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setShowCreate(false)}>
                Annuler
              </button>
              <button type="submit" className={styles.primaryButton} disabled={saving}>
                {saving ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
