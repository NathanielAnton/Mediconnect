import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { pdfApi } from "../../../api/pdfApi";
import { downloadBlob } from "../../../utils/pdf/downloadBlob";
import styles from "./GeneratedDocumentsList.module.css";

const TYPE_LABELS = { ordonnance: "Ordonnance", facture: "Facture" };

export default function GeneratedDocumentsList({ rendezVousId, refreshKey = 0 }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitre, setEditTitre] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setDocuments(await pdfApi.listDocuments(rendezVousId));
    } catch {
      toast.error("Impossible de charger les documents archivés");
    } finally {
      setLoading(false);
    }
  }, [rendezVousId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleDownload = async (doc) => {
    try {
      const blob = await pdfApi.downloadDocument(doc.id);
      downloadBlob(blob, `${doc.titre}.pdf`);
    } catch {
      toast.error("Téléchargement impossible");
    }
  };

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setEditTitre(doc.titre);
    setEditFile(null);
  };

  const handleSaveEdit = async (doc) => {
    const formData = new FormData();
    formData.append("titre", editTitre.trim());
    if (editFile) formData.append("pdf", editFile);

    try {
      setSaving(true);
      await pdfApi.updateDocument(doc.id, formData);
      toast.success("Document mis à jour");
      setEditingId(null);
      load();
    } catch (error) {
      const firstError = Object.values(error.response?.data?.errors ?? {})[0]?.[0];
      toast.error(firstError || error.response?.data?.message || "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className={styles.hint}>Chargement des archives...</p>;
  }

  if (documents.length === 0) {
    return <p className={styles.hint}>Aucun document archivé pour ce rendez-vous.</p>;
  }

  return (
    <ul className={styles.list}>
      {documents.map((doc) => (
        <li key={doc.id} className={styles.item}>
          {editingId === doc.id ? (
            <div className={styles.editForm}>
              <input className={styles.input} value={editTitre} maxLength={255} onChange={(e) => setEditTitre(e.target.value)} />
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
              />
              <p className={styles.hint}>Un nouveau PDF remplace l'ancien fichier (sans historique).</p>
              <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setEditingId(null)}>
                  Annuler
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => handleSaveEdit(doc)}
                  disabled={saving || !editTitre.trim()}
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.info}>
                <span className={styles.title}>{doc.titre}</span>
                <span className={styles.meta}>
                  {TYPE_LABELS[doc.type]} - {new Date(doc.created_at).toLocaleString("fr-FR")} - {Math.round(doc.taille / 1024)} Ko
                </span>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} onClick={() => handleDownload(doc)}>
                  Télécharger
                </button>
                <button type="button" className={styles.secondaryButton} onClick={() => startEdit(doc)}>
                  Modifier
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
