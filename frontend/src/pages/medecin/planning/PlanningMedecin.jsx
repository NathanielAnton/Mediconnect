import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import ModalHorairesHebdo from "./modals/ModalHorairesHebdo";
import ModalIndisponibilite from "./modals/ModalIndisponibilite";
import NavbarMedecin from "../components/NavbarMedecin";
import styles from './PlanningMedecin.module.css';
import api from "../../../api/axios"; 

export default function PlanningMedecin() {
  const [events, setEvents] = useState([]);
  const [showHoraireModal, setShowHoraireModal] = useState(false);
  const [showIndispoModal, setShowIndispoModal] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/medecin/planning");
      console.log("Réponse brute du planning :", res.data);

      const horaires = res.data.horaires
      .filter(h => h.actif === true) 
      .map((h) => ({
        title: `Disponible`,
        startTime: h.heure_debut,
        endTime: h.heure_fin,
        daysOfWeek: [convertJourToNumber(h.jour)], 
        display: "background",
        backgroundColor: "darkblue", 
        borderColor: "#3c57a2",
      }));

      const indisponibilites = res.data.indisponibilites.map((i) => ({
        title: i.motif || "Indisponible",
        start: i.date_debut,
        end: i.date_fin,
        backgroundColor: "lightgray", 
        borderColor: "lightgray",
      }));

      // Fusion des deux listesL
      setEvents([...horaires, ...indisponibilites]);
    } catch (err) {
      console.error("Erreur lors du chargement du planning :", err);
    }
  };

  // 🔹 Convertir les jours texte en index FullCalendar
  const convertJourToNumber = (jour) => {
    const jours = {
      dimanche: 0,
      lundi: 1,
      mardi: 2,
      mercredi: 3,
      jeudi: 4,
      vendredi: 5,
      samedi: 6,
    };
    return jours[jour.toLowerCase()] ?? 0;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className={styles.container}>
      <NavbarMedecin />
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mon planning</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowHoraireModal(true)} className="bg-blue-500 text-white px-3 py-1 rounded">
            Gestion des Horaires Hebdos
          </button>
          <button onClick={() => setShowIndispoModal(true)} className="bg-red-500 text-white px-3 py-1 rounded">
            Ajouter indisponibilité
          </button>
        </div>
      </div>

    <div className="p-4">
        <FullCalendar
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            height="auto"
            events={events}
            locale="fr"
            firstDay={1} 
            headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
            }}
            eventTextColor="#000"
        />
    </div>

      {showHoraireModal && <ModalHorairesHebdo onClose={() => setShowHoraireModal(false)} onUpdate={fetchEvents}/>}
      {showIndispoModal && <ModalIndisponibilite onClose={() => setShowIndispoModal(false)} />}
    </div>
    </div>
  );
}
