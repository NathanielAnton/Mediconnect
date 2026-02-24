import { useState, useEffect, useRef, useCallback, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { X } from "lucide-react";
import axiosInstance from "../../../../api/axios";
import { AuthContext } from "../../../../context/AuthContext";
import ModalReservationCreneau from "./ModalReservationCreneau";
import ModalUpdateRendezVous from "./ModalUpdateRendezVous";
import styles from "./ModalPlanningMedecin.module.css";

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

const addMinutes = (date, minutes) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() + minutes);
  return copy;
};

const parseDateTime = (dateKey, time) => new Date(`${dateKey}T${time}`);

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

const buildEvents = (horaires, indisponibilitesRaw, range, rendezvousRaw = []) => {
  if (!range) {
    return [];
  }

  const rendezvousEvents = rendezvousRaw
    .filter((rdv) => rdv.statut !== "annulé")
    .map((rdv) => {
      const backgroundColor = rdv.statut === "confirmé" ? "#10b981" : "#f59e0b";
      const borderColor = rdv.statut === "confirmé" ? "#059669" : "#d97706";
      return {
        id: `rdv-${rdv.id}`,
        title: rdv.client?.name || rdv.patient?.name || rdv.name || "RDV",
        start: new Date(rdv.date_debut),
        end: new Date(rdv.date_fin),
        backgroundColor,
        borderColor,
        textColor: "white",
        extendedProps: {
          type: "rendezvous",
          statut: rdv.statut,
          rdvData: rdv,
        },
      };
    });

  const occupiedSlots = rendezvousRaw
    .filter((rdv) => rdv.statut === "en_attente" || rdv.statut === "confirmé")
    .map((rdv) => ({
      start: new Date(rdv.date_debut),
      end: new Date(rdv.date_fin),
    }));

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
  const creneauxDisponibles = [];
  let cursor = new Date(range.start);
  const rangeEnd = new Date(range.end);
  const slotDurationMinutes = 30;
  const now = new Date();

  const twoMonthsFromNow = new Date();
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

  while (cursor < rangeEnd) {
    const dateKey = formatDateKey(cursor);
    const dayHoraires = horairesByDay[cursor.getDay()] || [];

    if (!blockedDates.has(dateKey)) {
      dayHoraires.forEach((h) => {
        disponibilites.push({
          title: "",
          start: `${dateKey}T${h.heure_debut}`,
          end: `${dateKey}T${h.heure_fin}`,
          display: "background",
          backgroundColor: "darkblue",
          borderColor: "#3c57a2",
        });

        let currentSlotStart = parseDateTime(dateKey, h.heure_debut);
        const dayEnd = parseDateTime(dateKey, h.heure_fin);

        while (currentSlotStart < dayEnd) {
          const currentSlotEnd = addMinutes(currentSlotStart, slotDurationMinutes);

          if (currentSlotEnd <= dayEnd) {
            const hasConflict = occupiedSlots.some(
              (slot) =>
                (currentSlotStart >= slot.start && currentSlotStart < slot.end) ||
                (currentSlotEnd > slot.start && currentSlotEnd <= slot.end) ||
                (currentSlotStart <= slot.start && currentSlotEnd >= slot.end)
            );

            const isInPast = currentSlotEnd <= now;
            const isAfterTwoMonths = currentSlotStart >= twoMonthsFromNow;

            if (!hasConflict && !isInPast && !isAfterTwoMonths) {
              creneauxDisponibles.push({
                title: "",
                start: new Date(currentSlotStart),
                end: new Date(currentSlotEnd),
                classNames: ["creneau-disponible"],
                display: "background",
                backgroundColor: "transparent",
                borderColor: "#10b981",
                textColor: "#10b981",
                extendedProps: {
                  type: "creneau",
                  statut: "disponible",
                },
              });
            }
          }

          currentSlotStart = currentSlotEnd;
        }
      });
    }

    cursor = addDays(cursor, 1);
  }

  return [...rendezvousEvents, ...disponibilites, ...indisponibilites, ...creneauxDisponibles];
};

const ModalPlanningMedecin = ({ medecin, onClose }) => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreneau, setSelectedCreneau] = useState(null);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [selectedRendezVous, setSelectedRendezVous] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const horairesRef = useRef([]);
  const indisposRef = useRef([]);
  const rendezvousRef = useRef([]);
  const currentRangeRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/secretaire/medecins/${medecin.id}/planning`);
      const nextHoraires = res.data.horaires || [];
      const nextIndispos = res.data.indisponibilites || [];
      const nextRendezvous = res.data.rendez_vous || [];

      horairesRef.current = nextHoraires;
      indisposRef.current = nextIndispos;
      rendezvousRef.current = nextRendezvous;

      if (currentRangeRef.current) {
        const newEvents = buildEvents(
          nextHoraires,
          nextIndispos,
          currentRangeRef.current,
          nextRendezvous
        );
        setEvents(newEvents);
      }
    } catch (err) {
      console.error("Erreur lors du chargement du planning:", err);
    } finally {
      setLoading(false);
    }
  }, [medecin.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Planning - Dr. {medecin.name}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingMessage}>Chargement du planning...</div>
          ) : (
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
              eventTimeFormat={false}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridWeek,timeGridDay",
              }}
              eventTextColor="#000"
              eventClick={(clickInfo) => {
                const { event } = clickInfo;
                if (event.extendedProps?.type === "creneau") {
                  setSelectedCreneau({
                    start: event.start,
                    end: event.end,
                  });
                  setShowRendezVousModal(true);
                } else if (event.extendedProps?.type === "rendezvous") {
                  setSelectedRendezVous(event.extendedProps.rdvData);
                  setShowUpdateModal(true);
                }
              }}
              eventContent={(eventInfo) => {
                const type = eventInfo.event.extendedProps?.type;
                if (type === "creneau") {
                  return { html: '<div class="event-creneau">✓</div>' };
                }
                return undefined;
              }}
              datesSet={(arg) => {
                const range = { start: arg.start, end: arg.end };
                currentRangeRef.current = range;
                setEvents(
                  buildEvents(
                    horairesRef.current,
                    indisposRef.current,
                    range,
                    rendezvousRef.current
                  )
                );
              }}
            />
          )}
        </div>
      </div>

      {showRendezVousModal && selectedCreneau && (
        <ModalReservationCreneau
          medecin={{
            medecin_id: horairesRef.current[0]?.medecin_id,
            name: medecin?.name,
          }}
          creneau={selectedCreneau}
          onClose={() => setShowRendezVousModal(false)}
          onSuccess={() => {
            fetchEvents();
            setShowRendezVousModal(false);
          }}
        />
      )}

      {showUpdateModal && selectedRendezVous && (
        <ModalUpdateRendezVous
          rendezVous={selectedRendezVous}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedRendezVous(null);
          }}
          onSuccess={() => {
            fetchEvents();
            setShowUpdateModal(false);
            setSelectedRendezVous(null);
          }}
        />
      )}
    </div>
  );
};

export default ModalPlanningMedecin;
