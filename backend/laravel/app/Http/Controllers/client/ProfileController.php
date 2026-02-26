<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Récupérer le profil du client
     */
    public function show(Request $request)
    {
        $client = $request->user();

        return response()->json([
            'user' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'address' => $client->address,
                'roles' => $client->getRoleNames()
            ]
        ]);
    }

    /**
     * Mettre à jour le profil du client
     */
    public function update(Request $request)
    {
        $client = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'address' => 'sometimes|string|max:255'
        ]);

        $client->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'address' => $client->address
            ]
        ]);
    }
}
