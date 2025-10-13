<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:client,medecin,admin',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assigner le rôle avec spatie/laravel-permission
        $user->assignRole($request->role);

        Auth::login($user);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getMainRoleAttribute(), // Récupérer le rôle principal
            ],
            'token' => 'session-based',
            'roles' => $user->getRoleNames()->toArray()
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $request->session()->regenerate();
            
            $user = Auth::user();
            
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getMainRoleAttribute(), // Récupérer le rôle principal
                ],
                'token' => 'session-based',
                'roles' => $user->getRoleNames()->toArray()
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    public function logout(Request $request)
    {
        try {
            Auth::logout();
            
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return response()->json(['message' => 'Déconnexion réussie']);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la déconnexion'], 500);
        }
    }

    public function user(Request $request)
    {
        try {
            if (Auth::check()) {
                $user = Auth::user();
                
                return response()->json([
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->getMainRoleAttribute(),
                    ],
                    'roles' => $user->getRoleNames()->toArray()
                ]);
            }
            
            return response()->json(['message' => 'Non authentifié'], 401);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }
}