import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Rediriger si pas connecté ET chargement terminé
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  // Afficher le dashboard si connecté
  if (!user) {
    return null; // Ou redirection via useEffect
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenue, {user.name}!</p>
      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Déconnexion
      </button>
    </div>
  );
};

export default Dashboard;