import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import GestionnaireRequest from "./pages/GestionnaireRequest";
import Dashboard from "./pages/Dashboard";
import MedecinProfile from "./pages/medecin/profile/MedecinProfile";
import PlanningMedecin from "./pages/medecin/planning/PlanningMedecin";
import DashboardMedecin from "./pages/medecin/dashboard/DashboardMedecin";
import SearchMedecin from "./pages/rdv/SearchMedecin";
import Home from "./pages/Home";
import DashboardGestionnaire from "./pages/gestionnaire/dashboard/DashboardGestionnaire";
import DashboardSecretaire from "./pages/secretaire/dashboard/DashboardSecretaire";
import DashboardSuperAdmin from "./pages/superadmin/dashboard/DashboardSuperAdmin";
import DashboardAdmin from "./pages/admin/dashboard/DashboardAdmin";
import GestionnaireRequests from "./pages/admin/gestionnaire-requests/GestionnaireRequests";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<SearchMedecin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demande-gestionnaire" element={<GestionnaireRequest />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medecin/profile" element={<MedecinProfile />} />
        <Route path="/medecin/planning" element={<PlanningMedecin />} />
        <Route path="/medecin/dashboard" element={<DashboardMedecin />} />
        <Route path="/gestionnaire/dashboard" element={<DashboardGestionnaire />} />
        <Route path="/secretaire/dashboard" element={<DashboardSecretaire />} />
        <Route path="/super-admin/dashboard" element={<DashboardSuperAdmin />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/demandes-gestionnaires" element={<GestionnaireRequests />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
