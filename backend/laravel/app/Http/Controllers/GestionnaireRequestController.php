<?php

namespace App\Http\Controllers;

use App\Models\DemandeGestionnaire;
use App\Models\User;
use App\Models\Gestionnaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class GestionnaireRequestController extends Controller
{
    public function store(Request $request)
    {
        // Validation avec messages en français
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:demandes_gestionnaire,email',
            'password' => 'required|string|min:6',
            'telephone' => 'required|string|max:20',
            'etablissement' => 'required|string|max:255',
        ], [
            'name.required' => 'Le nom est requis',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères',
            'email.required' => 'L\'adresse email est requise',
            'email.email' => 'L\'adresse email n\'est pas valide',
            'email.unique' => 'Une demande avec cette adresse email existe déjà',
            'password.required' => 'Le mot de passe est requis',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères',
            'telephone.required' => 'Le numéro de téléphone est requis',
            'telephone.max' => 'Le numéro de téléphone ne peut pas dépasser 20 caractères',
            'etablissement.required' => 'Le nom de l\'établissement est requis',
            'etablissement.max' => 'Le nom de l\'établissement ne peut pas dépasser 255 caractères',
        ]);

        $demande = DemandeGestionnaire::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'etablissement' => $request->etablissement,
            'statut' => 'en_attente',
        ]);

        return response()->json([
            'message' => 'Votre demande a été envoyée avec succès. Vous serez notifié par email.',
            'demande' => [
                'id' => $demande->id,
                'name' => $demande->name,
                'email' => $demande->email,
                'statut' => $demande->statut,
            ]
        ], 201);
    }

    public function index()
    {
        $demandes = DemandeGestionnaire::orderBy('created_at', 'desc')->get();
        return response()->json($demandes);
    }

    public function show($id)
    {
        $demande = DemandeGestionnaire::findOrFail($id);
        return response()->json($demande);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:en_attente,approuvee,refusee',
            'commentaire_admin' => 'nullable|string',
        ]);

        $demande = DemandeGestionnaire::findOrFail($id);

        // Si la demande est approuvée, créer le user et le gestionnaire
        if ($request->statut === 'approuvee' && $demande->statut !== 'approuvee') {
            DB::beginTransaction();
            try {
                // Vérifier si un utilisateur avec cet email existe déjà
                $existingUser = User::where('email', $demande->email)->first();

                if ($existingUser) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Un utilisateur avec cet email existe déjà'
                    ], 422);
                }

                // Créer l'utilisateur
                $user = User::create([
                    'name' => $demande->name,
                    'email' => $demande->email,
                    'password' => $demande->password, // Déjà hashé
                ]);

                // Assigner le rôle gestionnaire
                $user->assignRole('gestionnaire');

                // Créer l'entrée gestionnaire avec les infos supplémentaires
                Gestionnaire::create([
                    'user_id' => $user->id,
                    'telephone' => $demande->telephone,
                    'etablissement' => $demande->etablissement,
                ]);

                // Mettre à jour le statut de la demande
                $demande->update([
                    'statut' => $request->statut,
                    'commentaire_admin' => $request->commentaire_admin,
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Demande approuvée et compte gestionnaire créé avec succès',
                    'demande' => $demande,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ]
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Erreur lors de la création du compte gestionnaire',
                    'error' => $e->getMessage()
                ], 500);
            }
        } else {
            // Si refusée ou autre statut, juste mettre à jour
            $demande->update([
                'statut' => $request->statut,
                'commentaire_admin' => $request->commentaire_admin,
            ]);

            return response()->json([
                'message' => 'Statut mis à jour avec succès',
                'demande' => $demande
            ]);
        }
    }
}
