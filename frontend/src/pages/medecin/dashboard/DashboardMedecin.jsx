import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardMedecin = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Médecin */}
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h1 className="text-xl font-bold">Espace Médecin</h1>
            </div>

            {/* Navigation links */}
            <div className="flex items-center space-x-6">
              <a href="#planning" className="hover:text-green-200 transition duration-200">
                Planning
              </a>
              <a href="#patients" className="hover:text-green-200 transition duration-200">
                Dossiers Patients
              </a>
              <a href="#consultations" className="hover:text-green-200 transition duration-200">
                Consultations
              </a>
              <a href="#prescriptions" className="hover:text-green-200 transition duration-200">
                Prescriptions
              </a>
              <a href="#statistiques" className="hover:text-green-200 transition duration-200">
                Statistiques
              </a>
            </div>

            {/* User info et déconnexion */}
            <div className="flex items-center space-x-4">
              <span className="text-green-100">Dr. {user.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tableau de Bord Médical</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800">Rendez-vous Aujourd'hui</h3>
              <p className="text-green-600 text-2xl font-bold">8</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800">Patients en Attente</h3>
              <p className="text-blue-600 text-2xl font-bold">3</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800">Consultations du Mois</h3>
              <p className="text-purple-600 text-2xl font-bold">156</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800">Prescriptions en Cours</h3>
              <p className="text-orange-600 text-2xl font-bold">24</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Rendez-vous du Jour</h3>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>09:00 - Jean Dupont</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmé</span>
                </li>
                <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>10:30 - Marie Martin</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">En attente</span>
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Actions Rapides</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-green-500 text-white p-3 rounded hover:bg-green-600 transition duration-200 text-sm">
                  Nouvelle Consultation
                </button>
                <button className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-200 text-sm">
                  Voir le Planning
                </button>
                <button className="bg-purple-500 text-white p-3 rounded hover:bg-purple-600 transition duration-200 text-sm">
                  Gérer les Dossiers
                </button>
                <button className="bg-orange-500 text-white p-3 rounded hover:bg-orange-600 transition duration-200 text-sm">
                  Rédiger Ordonnance
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardMedecin;