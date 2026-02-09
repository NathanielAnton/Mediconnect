<?php

namespace App\Http\Controllers;

use App\Models\DemandeGestionnaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
