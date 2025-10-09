import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form.name, form.email, form.password, form.role);
    alert("Inscription réussie !");
    navigate("/login");
  };

  return (
    <div className="p-4">
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nom" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Mot de passe" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="client">Client</option>
          <option value="medecin">Médecin</option>
        </select>
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}
