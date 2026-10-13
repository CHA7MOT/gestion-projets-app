<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        return response()->json(Task::with(['project', 'user'])->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'date' => 'required|date',
            'task_type' => 'required|in:Installation,Maintenance,Réparation,Désinstallation',
            'task_id' => 'required|string|size:5',
            'status' => 'required|in:Vient de commencer,En cours,Bientôt terminé,Terminé',
            'description' => 'required|string',
        ]);
        
        $project = \App\Models\Project::findOrFail($validated['project_id']);
        if ($project->status === 'closed') {
            return response()->json(['message' => 'Impossible d\'ajouter une tâche à un projet fermé.'], 403);
        }

        $validated['user_id'] = $request->user()->id;

        $task = Task::create($validated);
        return response()->json($task->load(['project', 'user']), 201);
    }

    public function show($id)
    {
        return response()->json(Task::with(['project', 'user'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        if ($task->user_id !== $request->user()->id && $request->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($task->project->status === 'closed') {
            return response()->json(['message' => 'Impossible de modifier une tâche d\'un projet fermé.'], 403);
        }

        $validated = $request->validate([
            'project_id' => 'sometimes|required|exists:projects,id',
            'date' => 'sometimes|required|date',
            'task_type' => 'sometimes|required|in:Installation,Maintenance,Réparation,Désinstallation',
            'task_id' => 'sometimes|required|string|size:5',
            'status' => 'sometimes|required|in:Vient de commencer,En cours,Bientôt terminé,Terminé',
            'description' => 'sometimes|required|string',
        ]);

        $task->update($validated);
        return response()->json($task->load(['project', 'user']));
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);

        if ($task->user_id !== request()->user()->id && request()->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($task->project->status === 'closed') {
            return response()->json(['message' => 'Impossible de supprimer une tâche d\'un projet fermé.'], 403);
        }

        $task->delete();
        return response()->json(null, 204);
    }
}
