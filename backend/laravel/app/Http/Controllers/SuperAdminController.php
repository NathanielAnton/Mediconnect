<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;

class SuperAdminController extends Controller
{
    /**
     * Dashboard du super admin
     */
    public function dashboard()
    {
        $roles = Role::all();
        $usersByRole = [];
        
        foreach ($roles as $role) {
            $usersByRole[] = [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => User::role($role->name)->count()
            ];
        }

        $stats = [
            'total_users' => User::count(),
            'total_roles' => Role::count(),
            'users_by_role' => $usersByRole,
        ];

        return response()->json([
            'message' => 'Bienvenue Super Admin',
            'user' => auth()->user(),
            'stats' => $stats
        ]);
    }

    /**
     * Gérer tous les utilisateurs
     */
    public function getAllUsers()
    {
        $users = User::with('roles')->get();

        return response()->json([
            'users' => $users
        ]);
    }

    /**
     * Assigner un rôle à un utilisateur
     */
    public function assignRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|exists:roles,name'
        ]);

        $user = User::findOrFail($request->user_id);
        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => "Rôle {$request->role} assigné avec succès",
            'user' => $user->load('roles')
        ]);
    }

    /**
     * Créer un nouveau rôle
     */
    public function createRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name'
        ]);

        $role = Role::create(['name' => $request->name]);

        return response()->json([
            'message' => 'Rôle créé avec succès',
            'role' => $role
        ], 201);
    }

    /**
     * Obtenir tous les rôles
     */
    public function getAllRoles()
    {
        $roles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'users_count' => User::role($role->name)->count(),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ];
        });

        return response()->json([
            'roles' => $roles
        ]);
    }
}
