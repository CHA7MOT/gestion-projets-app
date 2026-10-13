<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::with(['role', 'projects'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'specialite' => 'nullable|string|max:255',
            'role_id' => 'required|exists:roles,id',
            'project_ids' => 'nullable|array',
            'project_ids.*' => 'exists:projects,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        if (isset($validated['project_ids'])) {
            $user->projects()->sync($validated['project_ids']);
        }

        return response()->json($user->load(['role', 'projects']), 201);
    }

    public function show($id)
    {
        return response()->json(User::with(['role', 'projects'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'specialite' => 'nullable|string|max:255',
            'role_id' => 'sometimes|required|exists:roles,id',
            'project_ids' => 'nullable|array',
            'project_ids.*' => 'exists:projects,id',
        ]);

        if (auth()->id() == $user->id && isset($validated['role_id']) && $validated['role_id'] != $user->role_id) {
            return response()->json(['message' => 'Vous ne pouvez pas modifier votre propre rôle.'], 403);
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        if (array_key_exists('project_ids', $validated)) {
            $user->projects()->sync($validated['project_ids'] ?? []);
        }

        return response()->json($user->load(['role', 'projects']));
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }
        $user->delete();
        return response()->json(null, 204);
    }
}
