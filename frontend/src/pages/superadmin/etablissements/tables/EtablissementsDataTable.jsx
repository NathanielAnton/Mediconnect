import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../../../api/axios";
import { toast } from "react-toastify";

const EtablissementsDataTable = ({ hopitaux, onOpenMedecins }) => {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const [localHopitaux, setLocalHopitaux] = useState(hopitaux);

  useEffect(() => {
    setLocalHopitaux(hopitaux);
  }, [hopitaux]);

  // Masquer/réafficher un établissement (le masquage cache aussi en cascade ses médecins)
  const handleToggleHide = async (hopitalId, nextVisible, checkboxEl) => {
    const nextHide = !nextVisible;

    if (nextHide) {
      const result = await Swal.fire({
        title: "Masquer cet établissement ?",
        text: "Tous les médecins de cet établissement seront également masqués de la recherche publique.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Oui, masquer",
        cancelButtonText: "Annuler",
      });

      if (!result.isConfirmed) {
        checkboxEl.checked = true;
        return;
      }
    }

    try {
      await axiosInstance.put(`/super-admin/etablissements/${hopitalId}/hide`, {
        hide: nextHide,
      });
      toast.success(nextHide ? "Établissement masqué avec succès" : "Établissement réaffiché avec succès");
      setLocalHopitaux((prev) =>
        prev.map((h) => (h.id === Number(hopitalId) ? { ...h, hide: nextHide } : h))
      );

      // Après un masquage, on ouvre directement la liste des médecins pour permettre
      // au superadmin de choisir rapidement qui réafficher.
      if (nextHide) {
        onOpenMedecins(hopitalId);
      }
    } catch (error) {
      console.error("Erreur lors du changement de visibilité:", error);
      toast.error(error.response?.data?.message || "Erreur lors du changement de visibilité");
      checkboxEl.checked = !nextVisible;
    }
  };

  useEffect(() => {
    if (!tableRef.current) return;

    const handleTableClick = (e) => {
      const btnMedecins = e.target.closest(".btn-medecins");
      if (btnMedecins) {
        onOpenMedecins(btnMedecins.dataset.hopitalId);
      }
    };

    const handleTableChange = (e) => {
      const switchInput = e.target.closest(".switch-hide-input");
      if (switchInput) {
        handleToggleHide(switchInput.dataset.hopitalId, switchInput.checked, switchInput);
      }
    };

    tableRef.current.addEventListener("click", handleTableClick);
    tableRef.current.addEventListener("change", handleTableChange);

    return () => {
      if (tableRef.current) {
        tableRef.current.removeEventListener("click", handleTableClick);
        tableRef.current.removeEventListener("change", handleTableChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tableRef.current || !window.$) return;

    dataTableRef.current = window.$(tableRef.current).DataTable({
      data: [],
      columns: [
        { data: "id", title: "ID" },
        { data: "name", title: "Nom" },
        { data: "ville", title: "Ville" },
        { data: "telephone", title: "Téléphone" },
        { data: "medecins_count", title: "Médecins" },
        {
          data: null,
          title: "Visible",
          orderable: false,
          render: (data) => `
            <label class="switch" title="Visible dans la recherche et les pages publiques">
              <input type="checkbox" class="switch-hide-input" data-hopital-id="${data.id}" ${!data.hide ? "checked" : ""} />
              <span class="switch-slider"></span>
            </label>
          `,
        },
        {
          data: null,
          title: "Actions",
          orderable: false,
          render: (data) => `
            <button class="btn-action btn-medecins" data-hopital-id="${data.id}" title="Voir les médecins">
              <i class="bi bi-people"></i> Médecins
            </button>
          `,
        },
      ],
      pageLength: 10,
      responsive: true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/fr-FR.json",
      },
      dom: "lfrtip",
    });

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (dataTableRef.current) {
      dataTableRef.current.clear();
      dataTableRef.current.rows.add(localHopitaux);
      dataTableRef.current.draw(false);
    }
  }, [localHopitaux]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        ref={tableRef}
        style={{
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          borderCollapse: "collapse",
        }}
        className="display"
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th>ID</th>
            <th>Nom</th>
            <th>Ville</th>
            <th>Téléphone</th>
            <th>Médecins</th>
            <th>Visible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      <style>{`
        .btn-action {
          padding: 6px 10px;
          color: white;
          background-color: #1976d2;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s;
        }
        .btn-action:hover {
          background-color: #1565c0;
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 24px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .switch-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #f44336;
          border-radius: 24px;
          transition: background-color 0.2s;
        }
        .switch-slider::before {
          content: "";
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .switch input:checked + .switch-slider {
          background-color: #4CAF50;
        }
        .switch input:checked + .switch-slider::before {
          transform: translateX(18px);
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button {
          padding: 6px 10px;
          margin: 0 2px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button:hover {
          background-color: #f0f0f0;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button.current {
          background-color: #1976d2;
          color: white;
          border-color: #1976d2;
        }
      `}</style>
    </div>
  );
};

export default EtablissementsDataTable;
