import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
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
      {/* Navbar Admin */}
      <nav className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h1 className="text-xl font-bold">Espace Administrateur</h1>
            </div>

            {/* Navigation links */}
            <div className="flex items-center space-x-6">
              <a href="#utilisateurs" className="hover:text-red-200 transition duration-200">
                Utilisateurs
              </a>
              <a href="#statistiques" className="hover:text-red-200 transition duration-200">
                Statistiques
              </a>
              <a href="#parametres" className="hover:text-red-200 transition duration-200">
                Paramètres
              </a>
              <a href="#rapports" className="hover:text-red-200 transition duration-200">
                Rapports
              </a>
              <a href="#systeme" className="hover:text-red-200 transition duration-200">
                Système
              </a>
            </div>

            {/* User info et déconnexion */}
            <div className="flex items-center space-x-4">
              <span className="text-red-100">Admin: {user.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tableau de Bord Administratif</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800">Utilisateurs Totaux</h3>
              <p className="text-red-600 text-2xl font-bold">1,247</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800">Médecins</h3>
              <p className="text-blue-600 text-2xl font-bold">48</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800">Rendez-vous du Jour</h3>
              <p className="text-green-600 text-2xl font-bold">89</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800">Alertes Système</h3>
              <p className="text-purple-600 text-2xl font-bold">2</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Activité Récente</h3>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Nouvel utilisateur inscrit</span>
                  <span className="text-gray-500 text-sm">il y a 5 min</span>
                </li>
                <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Mise à jour système effectuée</span>
                  <span className="text-gray-500 text-sm">il y a 1h</span>
                </li>
                <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Rapport mensuel généré</span>
                  <span className="text-gray-500 text-sm">il y a 2h</span>
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Actions Administratives</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-red-500 text-white p-3 rounded hover:bg-red-600 transition duration-200 text-sm">
                  Gérer Utilisateurs
                </button>
                <button className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-200 text-sm">
                  Voir Statistiques
                </button>
                <button className="bg-green-500 text-white p-3 rounded hover:bg-green-600 transition duration-200 text-sm">
                  Paramètres Système
                </button>
                <button className="bg-purple-500 text-white p-3 rounded hover:bg-purple-600 transition duration-200 text-sm">
                  Générer Rapports
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;