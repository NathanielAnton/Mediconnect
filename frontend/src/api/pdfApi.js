import api from "./axios";

const base = "/medecin";

/**
 * Charge les logos référencés par les éléments image d'un layout.
 * @returns {Promise<Object<number, {bytes: ArrayBuffer, mime: string}>>}
 */
export const fetchImagesForLayout = async (elements = []) => {
  const ids = [...new Set(elements.filter((el) => el.type === "image" && el.pdf_image_id).map((el) => el.pdf_image_id))];
  const entries = await Promise.all(ids.map(async (id) => [id, await pdfApi.fetchImageBytes(id)]));
  return Object.fromEntries(entries);
};

export const pdfApi = {
  listRendezVous: () => api.get(`${base}/rendez-vous`).then((res) => res.data.rendez_vous),

  listImages: () => api.get(`${base}/pdf-images`).then((res) => res.data.images),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post(`${base}/pdf-images`, formData).then((res) => res.data.image);
  },

  deleteImage: (id) => api.delete(`${base}/pdf-images/${id}`),

  fetchImageBytes: (id) =>
    api
      .get(`${base}/pdf-images/${id}/file`, { responseType: "arraybuffer" })
      .then((res) => ({ bytes: res.data, mime: res.headers["content-type"] })),

  listTemplates: (type) =>
    api.get(`${base}/pdf-templates`, { params: type ? { type } : {} }).then((res) => res.data.templates),

  getTemplate: (id) => api.get(`${base}/pdf-templates/${id}`).then((res) => res.data.template),

  createTemplate: (payload) => api.post(`${base}/pdf-templates`, payload).then((res) => res.data.template),

  updateTemplate: (id, payload) =>
    api.put(`${base}/pdf-templates/${id}`, payload).then((res) => res.data.template),

  deleteTemplate: (id) => api.delete(`${base}/pdf-templates/${id}`),

  getPdfData: (rendezVousId) => api.get(`${base}/pdf-data/${rendezVousId}`).then((res) => res.data),

  listDocuments: (rendezVousId) =>
    api
      .get(`${base}/generated-documents`, { params: { rendez_vous_id: rendezVousId } })
      .then((res) => res.data.documents),

  createDocument: (formData) =>
    api.post(`${base}/generated-documents`, formData).then((res) => res.data.document),

  // Laravel n'accepte pas PUT en multipart : envoi en POST avec _method=PUT
  updateDocument: (id, formData) => {
    formData.append("_method", "PUT");
    return api.post(`${base}/generated-documents/${id}`, formData).then((res) => res.data.document);
  },

  downloadDocument: (id) =>
    api
      .get(`${base}/generated-documents/${id}/download`, { responseType: "blob" })
      .then((res) => res.data),
};
