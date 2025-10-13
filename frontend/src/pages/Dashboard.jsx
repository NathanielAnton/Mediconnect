import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardUser from './user/dashboard/DashboardUser';
import DashboardMedecin from './medecin/dashboard/DashboardMedecin';
import DashboardAdmin from './admin/dashboard/DashboardAdmin';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Rediriger si pas connecté
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Loader
  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  // Si pas d'utilisateur
  if (!user) {
    return null;
  }

  // Afficher le dashboard selon le rôle
  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'admin':
        return <DashboardAdmin />;
      case 'medecin':
        return <DashboardMedecin />;
      case 'client':
      default:
        return <DashboardUser />;
    }
  };

  return renderDashboardByRole();
};

export default Dashboard;