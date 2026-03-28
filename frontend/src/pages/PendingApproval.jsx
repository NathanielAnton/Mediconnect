import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, ArrowLeft, Stethoscope } from "lucide-react";

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Inscription en cours
          </h1>

          {/* Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 text-lg font-semibold mb-4">
              ✓ Votre compte a été créé avec succès
            </p>
            <p className="text-gray-600 mb-4">
              Votre inscription en tant que{" "}
              <span className="font-semibold">médecin indépendant</span> est en attente de
              vérification.
            </p>
            <p className="text-gray-600">
              Un de nos administrateurs examinera votre demande et activera votre compte sous peu.
              Vous recevrez un email de confirmation une fois votre compte validé.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800 mb-1">Quoi maintenant ?</p>
                <p className="text-sm text-green-700">
                  Veuillez patienter quelques heures. Vous pourrez vous connecter une fois que votre
                  compte sera activé par un administrateur.
                </p>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retourner à la connexion</span>
          </button>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Besoin d'aide ?{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                Contactez le support
              </a>
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">MediConnect</h2>
          </div>
          <p className="text-gray-600">Votre plateforme médicale de référence</p>
        </div>
      </div>
    </div>
  );
}
