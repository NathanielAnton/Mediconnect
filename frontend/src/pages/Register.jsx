import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Stethoscope, UserCheck } from "lucide-react";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await register(form.name, form.email, form.password, form.role);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center pr-12">
        <div className="mb-8">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">MediConnect</h1>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
          Rejoignez notre communauté médicale et commencez votre parcours de santé connectée
        </p>
        
        {/* Benefits */}
        <div className="space-y-6 w-full max-w-md">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Accès gratuit</h3>
              <p className="text-gray-600 text-sm">Créez votre compte gratuitement sans engagement</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Simple et rapide</h3>
              <p className="text-gray-600 text-sm">Inscription en moins de 2 minutes</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Sécurisé</h3>
              <p className="text-gray-600 text-sm">Vos données sont protégées et confidentielles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Register Form */}
      <div className="w-full lg:w-1/2 max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 text-center">MediConnect</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Créer un compte</h2>
          <p className="text-gray-600 mb-8">Rejoignez MediConnect en quelques secondes</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm font-medium">Inscription réussie ! Redirection...</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">Au moins 6 caractères</p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Je m'inscris en tant que...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition ${form.role === "client" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={form.role === "client"}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800 text-sm">Patient</p>
                    <p className="text-gray-500 text-xs">Consulter un médecin</p>
                  </div>
                </label>

                <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition ${form.role === "medecin" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                  <input
                    type="radio"
                    name="role"
                    value="medecin"
                    checked={form.role === "medecin"}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800 text-sm">Médecin</p>
                    <p className="text-gray-500 text-xs">Gérer mes patients</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2">
              <input type="checkbox" required className="w-4 h-4 mt-1 rounded border-gray-300" />
              <label className="text-sm text-gray-600">
                J'accepte les <a href="#" className="text-blue-600 hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Inscription en cours...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  <span>Créer mon compte</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Se connecter
            </a>
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            Besoin d'aide ?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}