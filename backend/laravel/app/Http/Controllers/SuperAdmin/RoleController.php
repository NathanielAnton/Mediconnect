<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * SuperAdmin récupère tous les rôles
     */
    public function getAll()
    {
        $roles = Role::with('permissions')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->map(fn ($p) => $p->name),
                    'users_count' => $role->users()->count(),
                    'created_at' => $role->created_at,
                ];
            });

        return response()->json([
            'roles' => $roles,
            'total' => count($roles)
        ]);
    }

    /**
     * SuperAdmin crée un rôle
     */
    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name'
        ]);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'api'
        ]);

        return response()->json([
            'message' => 'Rôle créé avec succès',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => [],
                'created_at' => $role->created_at,
            ]
        ], 201);
    }

    /**
     * SuperAdmin récupère toutes les permissions
     */
    public function getPermissions()
    {
        $permissions = Permission::orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'guard_name' => $p->guard_name,
            ]);

        return response()->json([
            'permissions' => $permissions,
            'total' => count($permissions)
        ]);
    }

    /**
     * SuperAdmin assigne une permission à un rôle
     */
    public function assignPermission(Request $request)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permission' => 'required|exists:permissions,name'
        ]);

        $role = Role::findOrFail($request->role_id);
        $role->givePermissionTo($request->permission);

        return response()->json([
            'message' => 'Permission assignée avec succès',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->map(fn ($p) => $p->name),
            ]
        ]);
    }
}
