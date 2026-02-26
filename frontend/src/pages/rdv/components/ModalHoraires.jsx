import { useEffect, useRef, useState, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import { AuthContext } from "../../../context/AuthContext";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";
import { X, Clock, Loader } from "lucide-react";
import api from "../../../api/axios";
import styles from "./ModalHoraires.module.css";
import ModalRendezVous from "../../user/planning/ModalRendezVous";
import { toast } from "react-toastify";

const ModalHoraires = ({ medecin, onClose }) => {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [slotDuration, setSlotDuration] = useState("00:30:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { roles, user } = useContext(AuthContext);
  const [showRendezVousModal, setShowRendezVousModal] = useState(false);
  const [selectedCreneau, setSelectedCreneau] = useState(null);

  // Fonction pour convertir les jours texte en index FullCalendar
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

  // Charger les horaires du médecin
  const fetchMedecinHoraires = async () => {
    if (!medecin?.id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/medecin/planningbyid/" + medecin.medecin_id);
      console.log("Réponse planning médecin:", res.data);

      const horaires = res.data.horaires
        .filter((h) => h.actif === true)
        .map((h) => ({
          title: `Disponible - ${h.heure_debut} à ${h.heure_fin}`,
          startTime: h.heure_debut,
          endTime: h.heure_fin,
          daysOfWeek: [convertJourToNumber(h.jour)],
          display: "background",
          backgroundColor: "#0596DE",
          borderColor: "#0478b6",
          extendedProps: {
            type: "disponible",
            jour: h.jour,
            heure_debut: h.heure_debut,
            heure_fin: h.heure_fin,
          },
        }));

      const indisponibilites = res.data.indisponibilites.map((i) => ({
        title: i.motif || "Indisponible",
        start: i.date_debut,
        end: i.date_fin,
        backgroundColor: "#6b7280",
        borderColor: "#4b5563",
        display: "background",
        extendedProps: {
          type: "indisponible",
          motif: i.motif,
        },
      }));

      // Récupérer les rendez-vous existants (déjà dans la réponse du planning)
      const rendezVousReserves = (res.data.rendez_vous || []).map((rdv) => {
        const isClientActuel = user?.id === rdv.client_id;
        return {
          title: isClientActuel ? "Votre RDV" : "RDV réservé",
          start: rdv.date_debut,
          end: rdv.date_fin,
          backgroundColor: isClientActuel ? "#10b981" : "#9ca3af",
          borderColor: isClientActuel ? "#059669" : "#6b7280",
          display: "block",
          extendedProps: {
            type: "rendezvous",
            isClientActuel,
            motif: rdv.motif,
          },
        };
      });

      // Créer un tableau des créneaux occupés par le client connecté
      const creneauxOccupesClient = rendezVousReserves
        .filter((rdv) => rdv.extendedProps.isClientActuel)
        .map((rdv) => ({
          start: new Date(rdv.start).getTime(),
          end: new Date(rdv.end).getTime(),
        }));

      // Fonction pour vérifier si un créneau est occupé par le client
      const isCrenauOccupyByClient = (creneauStart, creneauEnd) => {
        const creneauStartTime = new Date(creneauStart).getTime();
        const creneauEndTime = new Date(creneauEnd).getTime();
        return creneauxOccupesClient.some(
          (occupied) => creneauStartTime >= occupied.start && creneauEndTime <= occupied.end
        );
      };

      // Événements normaux pour les créneaux réservables
      const creneauxDisponibles = res.data.horaires
        .filter((h) => h.actif === true)
        .flatMap((h) => {
          const dayNumber = convertJourToNumber(h.jour);
          return genererCreneaux(
            h.heure_debut,
            h.heure_fin,
            dayNumber,
            slotDuration,
            isCrenauOccupyByClient
          );
        });

      setEvents([...horaires, ...indisponibilites, ...rendezVousReserves, ...creneauxDisponibles]);
    } catch (err) {
      console.error("Erreur lors du chargement du planning :", err);
      setError("Impossible de charger les horaires du médecin");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer les créneaux individuels
  const genererCreneaux = (heureDebut, heureFin, jour, dureeCreneau, isCrenauOccupyByClient) => {
    const creneaux = [];
    const debut = new Date(`1970-01-01T${heureDebut}`);
    const fin = new Date(`1970-01-01T${heureFin}`);
    const dureeMs = dureeCreneau === "00:15:00" ? 15 * 60 * 1000 : 30 * 60 * 1000;

    let currentTime = debut;

    while (currentTime < fin) {
      const endTime = new Date(currentTime.getTime() + dureeMs);

      if (endTime <= fin) {
        // Créer des dates complètes pour vérifier si le client a un RDV
        const now = new Date();
        const creneauStartFull = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          currentTime.getHours(),
          currentTime.getMinutes()
        );
        const creneauEndFull = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          endTime.getHours(),
          endTime.getMinutes()
        );

        // Ne pas ajouter le créneau si le client a déjà un RDV à ce moment
        if (!isCrenauOccupyByClient(creneauStartFull, creneauEndFull)) {
          creneaux.push({
            title: "Créneau disponible",
            startTime: formatTime(currentTime),
            endTime: formatTime(endTime),
            daysOfWeek: [jour],
            backgroundColor: "transparent",
            borderColor: "#d1d5db",
            textColor: "#6b7280",
            classNames: ["creneau-disponible"],
            extendedProps: {
              type: "creneau",
              statut: "disponible",
            },
          });
        }
      }

      currentTime = endTime;
    }

    return creneaux;
  };

  // Formater l'heure en HH:mm
  const formatTime = (date) => {
    return date.toTimeString().slice(0, 5);
  };

  useEffect(() => {
    if (medecin) {
      fetchMedecinHoraires();
    }
  }, [medecin]);

  // Re-générer les créneaux quand la durée change
  useEffect(() => {
    if (events.length > 0 && medecin) {
      fetchMedecinHoraires();
    }
  }, [slotDuration]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleSlotDuration = () => {
    setSlotDuration((prev) => (prev === "00:30:00" ? "00:15:00" : "00:30:00"));
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;

    // Gestion des clics sur les rendez-vous
    if (extendedProps.type === "rendezvous") {
      if (extendedProps.isClientActuel) {
        toast.info("Votre RDV");
      } else {
        toast.info("Rendez-vous réservé");
      }
      return;
    }

    // Vérifier si le créneau est passé
    if (event.start && new Date(event.start) < new Date()) {
      toast.error("Ce créneau est passé.");
      return;
    }

    if (roles === "Non authentifié") {
      toast.error("Veuillez vous connecter pour prendre un rendez-vous.");
      return;
    }

    if (extendedProps.type === "creneau" && extendedProps.statut === "disponible") {
      setSelectedCreneau({
        start: event.start,
        end: event.end,
      });
      setShowRendezVousModal(true);
    }
  };

  const handleRendezVousSuccess = (rendezVous) => {
    console.log("Rendez-vous créé:", rendezVous);
    // Optionnel : rafraîchir les événements du calendrier
    fetchMedecinHoraires();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        {/* En-tête du modal */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <h2>Horaires du Dr. {medecin?.name}</h2>
            <p className={styles.modalSubtitle}>{medecin?.specialite}</p>
            {medecin?.ville && (
              <p className={styles.modalLocation}>
                📍 {medecin.ville} {medecin.adresse && `- ${medecin.adresse}`}
              </p>
            )}
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={toggleSlotDuration}
              className={styles.durationButton}
              disabled={loading}
            >
              <Clock size={16} />
              {slotDuration === "00:30:00" ? "30min" : "15min"}
            </button>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Corps du modal avec le calendrier */}
        <div className={styles.modalBody}>
          {loading && (
            <div className={styles.loadingContainer}>
              <Loader className={styles.spinner} size={32} />
              <p>Chargement des horaires...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
              <button onClick={fetchMedecinHoraires} className={styles.retryButton}>
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className={styles.calendarContainer}>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[timeGridPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: "prev,next",
                    center: "title",
                    right: "timeGridWeek,timeGridDay",
                  }}
                  locale={frLocale}
                  firstDay={1}
                  slotMinTime="06:00:00"
                  slotMaxTime="21:00:00"
                  slotDuration={slotDuration}
                  slotLabelInterval={slotDuration}
                  allDaySlot={false}
                  height="auto"
                  events={events}
                  eventDisplay="block"
                  eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }}
                  slotLabelFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }}
                  eventClick={handleEventClick}
                  eventDidMount={(eventInfo) => {
                    const type = eventInfo.event.extendedProps.type;
                    const isPassé =
                      eventInfo.event.start && new Date(eventInfo.event.start) < new Date();

                    // Supprimer les créneaux passés
                    if (type === "creneau" && isPassé) {
                      eventInfo.event.remove();
                      return;
                    }

                    // Masquer et désactiver les créneaux qui chevauchent un RDV (client ou autres)
                    if (type === "creneau") {
                      const creneauStart = new Date(eventInfo.event.start).getTime();
                      const creneauEnd = new Date(eventInfo.event.end).getTime();

                      // Vérifier si UN RDV (quel qu'il soit) chevauche ce créneau
                      const hasRDV = events.some((event) => {
                        if (event.extendedProps?.type === "rendezvous") {
                          const rdvStart = new Date(event.start).getTime();
                          const rdvEnd = new Date(event.end).getTime();
                          // Vérifier le chevauchement
                          return creneauStart < rdvEnd && creneauEnd > rdvStart;
                        }
                        return false;
                      });

                      if (hasRDV) {
                        eventInfo.event.remove();
                        return;
                      }
                    }

                    // Ajouter les classes pour les rendez-vous
                    if (type === "rendezvous") {
                      const isClientActuel = eventInfo.event.extendedProps.isClientActuel;
                      if (isClientActuel) {
                        eventInfo.el.classList.add("fc-event-rendezvous-client");
                      } else {
                        eventInfo.el.classList.add("fc-event-rendezvous-other");
                      }
                    }
                  }}
                  eventContent={(eventInfo) => {
                    // Personnaliser l'affichage des événements
                    const type = eventInfo.event.extendedProps.type;

                    if (type === "disponible") {
                      return {
                        html: `<div class="event-disponible">${eventInfo.timeText}</div>`,
                      };
                    }

                    if (type === "creneau") {
                      return {
                        html: `<div class="event-creneau">✓</div>`,
                      };
                    }

                    return { html: eventInfo.event.title };
                  }}
                />
              </div>

              {/* Légende */}
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: "#0596DE" }}></div>
                  <span>Plages horaires disponibles</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: "#6b7280" }}></div>
                  <span>Indisponible</span>
                </div>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{
                      backgroundColor: "transparent",
                      border: "2px solid #10b981",
                    }}
                  ></div>
                  <span>Créneaux réservables</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: "#10b981" }}></div>
                  <span>Vos rendez-vous</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: "#9ca3af" }}></div>
                  <span>RDV réservés (autres)</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.slotInfo}>
                    <Clock size={14} />
                    <span>
                      Créneaux : {slotDuration === "00:30:00" ? "30 minutes" : "15 minutes"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pied du modal */}
        <div className={styles.modalFooter}>
          <div className={styles.footerInfo}>
            <p>
              {!loading &&
                !error &&
                "Cliquez sur un créneau disponible (✓) pour prendre rendez-vous"}
            </p>
          </div>
          <div className={styles.footerActions}>
            <button onClick={onClose} className={styles.closeModalButton}>
              Fermer
            </button>
          </div>
        </div>

        {/* Modal de prise de rendez-vous */}
        {showRendezVousModal && selectedCreneau && (
          <ModalRendezVous
            medecin={medecin}
            creneau={selectedCreneau}
            onClose={() => setShowRendezVousModal(false)}
            onSuccess={handleRendezVousSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default ModalHoraires;
