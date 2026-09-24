import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PublicLayout from "./PublicLayout";
import styles from "./PublicPage.module.css";

const FAQ_ITEMS = [
  {
    question: "Comment prendre rendez-vous avec un médecin ?",
    answer:
      "Rendez-vous sur la page d'accueil, recherchez un médecin par nom, spécialité ou ville, consultez ses horaires disponibles puis confirmez votre créneau.",
  },
  {
    question: "Ai-je besoin d'un compte pour prendre rendez-vous ?",
    answer:
      "Vous pouvez rechercher un médecin librement. La création d'un compte vous permet ensuite de suivre vos rendez-vous et de recevoir des rappels.",
  },
  {
    question: "Comment annuler ou modifier un rendez-vous ?",
    answer:
      "Depuis votre espace personnel, section « Mes rendez-vous », vous pouvez consulter, annuler ou reprogrammer vos rendez-vous à venir.",
  },
  {
    question: "Comment mon hôpital ou cabinet peut-il rejoindre MediConnect ?",
    answer:
      "Consultez la page « Professionnels de santé » et soumettez une demande directeur ou gestionnaire ; notre équipe validera votre inscription.",
  },
  {
    question: "Mes données médicales sont-elles protégées ?",
    answer:
      "Oui, vos données personnelles et médicales sont stockées de manière sécurisée et ne sont accessibles qu'aux professionnels de santé concernés.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <PublicLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Questions fréquentes</h1>
            <p className={styles.heroSubtitle}>
              Retrouvez les réponses aux questions les plus posées sur MediConnect.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.accordion}>
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.question} className={styles.accordionItem}>
                  <button
                    type="button"
                    className={styles.accordionButton}
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <ChevronUp className={styles.accordionIconOpen} />
                    ) : (
                      <ChevronDown className={styles.accordionIconOpen} />
                    )}
                  </button>
                  {isOpen && <p className={styles.accordionAnswer}>{item.answer}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
