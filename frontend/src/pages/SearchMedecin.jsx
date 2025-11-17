import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, User } from 'lucide-react';
import styles from '../SearchMedecin.module.css';
import ModalHoraires from './rdv/components/ModalHoraires'; 
import api from "/src/api/axios";

export default function SearchMedecin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [showHorairesModal, setShowHorairesModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.get(`/search/medecins?query=${encodeURIComponent(searchQuery)}`);
      setMedecins(response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setMedecins([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir le modal des horaires
  const handleShowHoraires = (medecin) => {
    setSelectedMedecin(medecin);
    setShowHorairesModal(true);
  };

  // Fonction pour fermer le modal
  const handleCloseHoraires = () => {
    setShowHorairesModal(false);
    setSelectedMedecin(null);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Reset si le champ est vidé
    if (value.trim() === '') {
      setMedecins([]);
      setSearched(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            Trouvez votre médecin en quelques clics
          </h2>
          <p className={styles.heroSubtitle}>
            Recherchez par nom de médecin ou par ville
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Nom du médecin, ville..."
                value={searchQuery}
                onChange={handleInputChange}
                className={styles.searchInput}
              />
              <button 
                type="submit" 
                className={styles.searchButton}
                disabled={loading}
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className={styles.results}>
        <div className={styles.resultsContent}>
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Recherche en cours...</p>
            </div>
          )}

          {!loading && searched && medecins.length === 0 && (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <h3 className={styles.noResultsTitle}>Aucun résultat trouvé</h3>
              <p className={styles.noResultsText}>
                Essayez avec un autre nom ou une autre ville
              </p>
            </div>
          )}

          {!loading && medecins.length > 0 && (
            <>
              <div className={styles.resultsHeader}>
                <h3 className={styles.resultsTitle}>
                  {medecins.length} médecin{medecins.length > 1 ? 's' : ''} trouvé{medecins.length > 1 ? 's' : ''}
                </h3>
              </div>

              <div className={styles.medecinGrid}>
                {medecins.map((medecin) => (
                  <div key={medecin.id} className={styles.medecinCard}>
                    <div className={styles.medecinHeader}>
                      <div className={styles.medecinAvatar}>
                        <User className={styles.avatarIcon} />
                      </div>
                      <div className={styles.medecinInfo}>
                        <h4 className={styles.medecinName}>Dr. {medecin.name}</h4>
                        <p className={styles.medecinSpecialite}>
                          {medecin.specialite}
                        </p>
                      </div>
                    </div>

                    <div className={styles.medecinBody}>
                      {medecin.description && (
                        <p className={styles.medecinDescription}>
                          {medecin.description}
                        </p>
                      )}

                      <div className={styles.medecinDetails}>
                        {medecin.ville && (
                          <div className={styles.detailItem}>
                            <MapPin className={styles.detailIcon} />
                            <span>{medecin.ville}</span>
                          </div>
                        )}
                        
                        {medecin.adresse && (
                          <div className={styles.detailItem}>
                            <MapPin className={styles.detailIcon} />
                            <span>{medecin.adresse}</span>
                          </div>
                        )}

                        {medecin.telephone && (
                          <div className={styles.detailItem}>
                            <Phone className={styles.detailIcon} />
                            <span>{medecin.telephone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.medecinFooter}>
                      <button 
                        onClick={() => handleShowHoraires(medecin)}
                        className={styles.appointmentButton}
                      >
                        Consulter les horaires
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!searched && !loading && (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🏥</div>
              <h3 className={styles.placeholderTitle}>
                Commencez votre recherche
              </h3>
              <p className={styles.placeholderText}>
                Entrez le nom d'un médecin ou d'une ville pour commencer
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal des horaires */}
      {showHorairesModal && selectedMedecin && (
        <ModalHoraires 
          medecin={selectedMedecin}
          onClose={handleCloseHoraires}
        />
      )}

    </div>
  );
}