import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchImagesForLayout, pdfApi } from "../../../api/pdfApi";
import { downloadBlob } from "../../../utils/pdf/downloadBlob";
import { generatePdf } from "../../../utils/pdf/generatePdf";
import { normalizeLayout, slugify } from "../../../utils/pdf/layout";
import GeneratedDocumentsList from "./GeneratedDocumentsList";
import styles from "./GenerateDocumentModal.module.css";

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const TYPE_LABELS = { ordonnance: "Ordonnance", facture: "Facture" };

export default function GenerateDocumentModal({ initialRendezVousId = null, onClose }) {
  const [rendezVousId, setRendezVousId] = useState(initialRendezVousId ? String(initialRendezVousId) : "");
  const [rendezVousOptions, setRendezVousOptions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [template, setTemplate] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [values, setValues] = useState({});
  const [titre, setTitre] = useState("");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fields = template?.layout?.elements?.filter((el) => el.type === "saisie" || el.type === "tableau") ?? [];

  useEffect(() => {
    pdfApi
      .listRendezVous()
      .then((list) =>
        setRendezVousOptions(
          list
            .filter((rdv) => rdv.statut !== "annulé")
            .map((rdv) => ({
              id: rdv.id,
              label: `${new Date(rdv.date_debut.replace(" ", "T")).toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              })} - ${rdv.name}`,
            }))
        )
      )
      .catch(() => toast.error("Impossible de charger les rendez-vous"));
  }, []);

  useEffect(() => {
    pdfApi
      .listTemplates()
      .then(setTemplates)
      .catch(() => toast.error("Impossible de charger les modèles"));
  }, []);

  useEffect(() => {
    if (!templateId) {
      setTemplate(null);
      return;
    }
    pdfApi
      .getTemplate(templateId)
      .then((loaded) => {
        setTemplate({ ...loaded, layout: normalizeLayout(loaded.layout) });
        setValues({});
        setPreview(null);
      })
      .catch(() => toast.error("Impossible de charger le modèle"));
  }, [templateId]);

  useEffect(() => {
    if (!rendezVousId) {
      setPdfData(null);
      return;
    }
    pdfApi
      .getPdfData(rendezVousId)
      .then(setPdfData)
      .catch(() => toast.error("Données du rendez-vous indisponibles"));
  }, [rendezVousId]);

  useEffect(() => {
    if (template && pdfData) {
      setTitre(`${template.nom} - ${pdfData.patient?.nom ?? ""} - ${pdfData.date_jour}`);
    }
  }, [template, pdfData]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const setValue = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setPreview(null);
  };

  const rowsOf = (key) => values[key] ?? [];

  const updateRow = (key, index, columnKey, value) => {
    const rows = [...rowsOf(key)];
    rows[index] = { ...rows[index], [columnKey]: value };
    setValue(key, rows);
  };

  const addRow = (key) => setValue(key, [...rowsOf(key), {}]);

  const removeRow = (key, index) => setValue(key, rowsOf(key).filter((_, i) => i !== index));

  const buildPdfBytes = async () =>
    generatePdf({
      layout: template.layout,
      data: pdfData,
      values,
      images: await fetchImagesForLayout(template.layout?.elements ?? []),
    });

  const handlePreview = async () => {
    try {
      setBusy(true);
      const bytes = await buildPdfBytes();
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      setPreview({ bytes, url });
    } catch (error) {
      toast.error(error.message || "Génération impossible");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    if (!preview) return;
    downloadBlob(new Blob([preview.bytes], { type: "application/pdf" }), `${titre || "document"}.pdf`);
  };

  const handleArchive = async () => {
    if (!titre.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    try {
      setBusy(true);
      const bytes = await buildPdfBytes();
      if (bytes.byteLength > MAX_PDF_BYTES) {
        toast.error("Document trop volumineux (5 Mo maximum)");
        return;
      }

      const formData = new FormData();
      formData.append("pdf", new File([bytes], `${slugify(titre) || "document"}.pdf`, { type: "application/pdf" }));
      formData.append("type", template.type);
      formData.append("titre", titre.trim());
      formData.append("rendez_vous_id", rendezVousId);
      formData.append("pdf_template_id", template.id);
      formData.append("donnees", JSON.stringify(values));

      await pdfApi.createDocument(formData);
      toast.success("Document archivé");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      const firstError = Object.values(error.response?.data?.errors ?? {})[0]?.[0];
      toast.error(firstError || error.response?.data?.message || error.message || "Archivage impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.heading}>Générer un document</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.form}>
            <label className={styles.field}>
              Rendez-vous
              <select className={styles.input} value={rendezVousId} onChange={(e) => setRendezVousId(e.target.value)}>
                <option value="">-- Choisir un rendez-vous --</option>
                {rendezVousOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              Modèle
              <select className={styles.input} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                <option value="">-- Choisir un modèle --</option>
                {templates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nom} ({TYPE_LABELS[item.type] ?? item.type})
                  </option>
                ))}
              </select>
            </label>

            {template && fields.length === 0 && (
              <p className={styles.hint}>Ce modèle ne contient aucun libellé à saisir.</p>
            )}

            {fields.map((el) =>
              el.type === "saisie" ? (
                <label key={el.id} className={styles.field}>
                  {el.label}
                  <input
                    className={styles.input}
                    value={values[el.key] ?? ""}
                    onChange={(e) => setValue(el.key, e.target.value)}
                  />
                </label>
              ) : (
                <div key={el.id} className={styles.field}>
                  <span>{el.label}</span>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          {(el.columns ?? []).map((col) => (
                            <th key={col.key}>{col.label}</th>
                          ))}
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {rowsOf(el.key).map((row, index) => (
                          <tr key={index}>
                            {(el.columns ?? []).map((col) => (
                              <td key={col.key}>
                                <input
                                  className={styles.cellInput}
                                  value={row[col.key] ?? ""}
                                  onChange={(e) => updateRow(el.key, index, col.key, e.target.value)}
                                />
                              </td>
                            ))}
                            <td>
                              <button type="button" className={styles.removeButton} onClick={() => removeRow(el.key, index)}>
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" className={styles.secondaryButton} onClick={() => addRow(el.key)}>
                    + Ajouter une ligne
                  </button>
                </div>
              )
            )}

            {template && (
              <label className={styles.field}>
                Titre du document
                <input className={styles.input} value={titre} maxLength={255} onChange={(e) => setTitre(e.target.value)} />
              </label>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handlePreview}
                disabled={busy || !template || !pdfData}
              >
                Générer l'aperçu
              </button>
              <button type="button" className={styles.secondaryButton} onClick={handleDownload} disabled={!preview}>
                Télécharger
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleArchive}
                disabled={busy || !template || !pdfData}
              >
                {busy ? "Traitement..." : "Archiver"}
              </button>
            </div>
          </div>

          <div className={styles.previewArea}>
            {preview ? (
              <iframe className={styles.preview} src={preview.url} title="Aperçu du document" />
            ) : (
              <p className={styles.hint}>L'aperçu du document apparaîtra ici.</p>
            )}
          </div>
        </div>

        {rendezVousId && (
          <section className={styles.archives}>
            <h3 className={styles.subheading}>Documents archivés pour ce rendez-vous</h3>
            <GeneratedDocumentsList rendezVousId={rendezVousId} refreshKey={refreshKey} />
          </section>
        )}
      </div>
    </div>
  );
}
