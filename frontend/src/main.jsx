import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MedecinProfile from "./pages/medecin/profile/MedecinProfile";
import PlanningMedecin from "./pages/medecin/planning/PlanningMedecin";
import SearchMedecin from "./pages/SearchMedecin";
import Home from "./pages/Home";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<SearchMedecin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medecin/profile" element={<MedecinProfile />} />
          <Route path="/medecin/planning" element={<PlanningMedecin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);