import { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import ModalHorairesHebdo from "./modals/ModalHorairesHebdo";
import ModalIndisponibilite from "./modals/ModalIndisponibilite";
import NavbarMedecin from "../components/NavbarMedecin";
import styles from "./PlanningMedecin.module.css";
import api from "../../../api/axios";

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey) => new Date(`${dateKey}T00:00:00`);

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

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

const buildEvents = (horaires, indisponibilitesRaw, range) => {
  if (!range) {
    return [];
  }

  const indisponibilites = indisponibilitesRaw.map((i) => {
    const startKey = i.date_debut.slice(0, 10);
    const endKey = i.date_fin.slice(0, 10);
    const endExclusive = addDays(parseDateKey(endKey), 1);

    return {
      title: i.motif || "Indisponible",
      start: startKey,
      end: formatDateKey(endExclusive),
      allDay: true,
      display: "background",
      backgroundColor: "#ef4444",
      borderColor: "#ef4444",
    };
  });

  const blockedDates = new Set();

  indisponibilitesRaw.forEach((i) => {
    const startKey = i.date_debut.slice(0, 10);
    const endKey = i.date_fin.slice(0, 10);
    let cursor = parseDateKey(startKey);
    const last = parseDateKey(endKey);

    while (cursor <= last) {
      blockedDates.add(formatDateKey(cursor));
      cursor = addDays(cursor, 1);
    }
  });

  const horairesActifs = horaires.filter((h) => h.actif === true);
  const horairesByDay = horairesActifs.reduce((acc, h) => {
    const dayNumber = convertJourToNumber(h.jour);
    if (!acc[dayNumber]) {
      acc[dayNumber] = [];
    }
    acc[dayNumber].push(h);
    return acc;
  }, {});

  const disponibilites = [];
  let cursor = new Date(range.start);
  const rangeEnd = new Date(range.end);

  while (cursor < rangeEnd) {
    const dateKey = formatDateKey(cursor);
    const dayHoraires = horairesByDay[cursor.getDay()] || [];

    if (!blockedDates.has(dateKey)) {
      dayHoraires.forEach((h) => {
        disponibilites.push({
          title: "Disponible",
          start: `${dateKey}T${h.heure_debut}`,
          end: `${dateKey}T${h.heure_fin}`,
          display: "background",
          backgroundColor: "darkblue",
          borderColor: "#3c57a2",
        });
      });
    }

    cursor = addDays(cursor, 1);
  }

  return [...disponibilites, ...indisponibilites];
};

export default function PlanningMedecin() {
  const [events, setEvents] = useState([]);
  const horairesRef = useRef([]);
  const indisposRef = useRef([]);
  const currentRangeRef = useRef(null);
  const [showHoraireModal, setShowHoraireModal] = useState(false);
  const [showIndispoModal, setShowIndispoModal] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get("/medecin/planning");
      console.log("Réponse brute du planning :", res.data);
      const nextHoraires = res.data.horaires || [];
      const nextIndispos = res.data.indisponibilites || [];

      horairesRef.current = nextHoraires;
      indisposRef.current = nextIndispos;

      if (currentRangeRef.current) {
        setEvents(buildEvents(nextHoraires, nextIndispos, currentRangeRef.current));
      }
    } catch (err) {
      console.error("Erreur lors du chargement du planning :", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className={styles.container}>
      <NavbarMedecin />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Mon planning</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHoraireModal(true)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Gestion des Horaires Hebdos
            </button>
            <button
              onClick={() => setShowIndispoModal(true)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
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
            datesSet={(arg) => {
              const range = { start: arg.start, end: arg.end };
              currentRangeRef.current = range;
              setEvents(buildEvents(horairesRef.current, indisposRef.current, range));
            }}
          />
        </div>

        {showHoraireModal && (
          <ModalHorairesHebdo onClose={() => setShowHoraireModal(false)} onUpdate={fetchEvents} />
        )}
        {showIndispoModal && <ModalIndisponibilite onClose={() => setShowIndispoModal(false)} />}
      </div>
    </div>
  );
}
