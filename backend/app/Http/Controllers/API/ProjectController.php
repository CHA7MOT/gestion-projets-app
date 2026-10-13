<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (strtolower($user->role->name) === 'user') {
            return response()->json($user->projects()->with(['users', 'tasks.user'])->latest()->get());
        }
        return response()->json(Project::with(['users', 'tasks.user'])->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_projet' => 'required|string|max:255',
            'description' => 'nullable|string',
            'nom_societe' => 'required|string|max:255',
            'contrat_start' => 'required|date',
            'contrat_end' => 'required|date',
            'status' => 'required|in:active,closed',
            'cps_file' => 'nullable|file|max:10240', 
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($request->hasFile('cps_file')) {
            $validated['cps_file'] = $request->file('cps_file')->store('cps_files', 'public');
        }

        $project = Project::create($validated);

        if (isset($validated['user_ids'])) {
            $project->users()->sync($validated['user_ids']);
        }

        return response()->json($project->load(['users', 'tasks.user']), 201);
    }

    public function show($id)
    {
        $project = Project::with(['users', 'tasks.user'])->findOrFail($id);
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'nom_projet' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'nom_societe' => 'sometimes|required|string|max:255',
            'contrat_start' => 'sometimes|required|date',
            'contrat_end' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:active,closed',
            'cps_file' => 'nullable|file|max:10240',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        // Fix for FormData sending empty string instead of null/file
        if ($request->has('cps_file') && $request->get('cps_file') === 'null') {
            $validated['cps_file'] = null;
        }

        if ($request->hasFile('cps_file')) {
            if ($project->cps_file) {
                Storage::disk('public')->delete($project->cps_file);
            }
            $validated['cps_file'] = $request->file('cps_file')->store('cps_files', 'public');
        } elseif (array_key_exists('cps_file', $validated) && $validated['cps_file'] === null) {
            if ($project->cps_file) {
                Storage::disk('public')->delete($project->cps_file);
            }
        }

        $project->update($validated);

        if (array_key_exists('user_ids', $validated)) {
            $project->users()->sync($validated['user_ids'] ?? []);
        }

        return response()->json($project->load(['users', 'tasks.user']));
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        if ($project->cps_file) {
            Storage::disk('public')->delete($project->cps_file);
        }
        $project->delete();
        return response()->json(null, 204);
    }
}
