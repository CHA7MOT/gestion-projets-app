<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Problem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProblemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roleName = strtolower(request()->user()->role->name);

        if (in_array($roleName, ['admin', 'supervisor'])) {
            return response()->json(Problem::with(['project', 'task', 'user'])->latest()->get());
        }

        return response()->json(Problem::with(['project', 'task', 'user'])->where('user_id', request()->user()->id)->latest()->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id'    => 'required|exists:tasks,id',
            'date'       => 'required|date',
            'description' => 'required|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $problem = Problem::create($validated);

        // Eager-load relations so we can reference them in notifications
        $problem->load(['project', 'task']);
        $nomProjet = $problem->project->nom_projet ?? 'Inconnu';
        $taskId    = $problem->task->task_id ?? 'Inconnue';
        $nomUser   = $request->user()->nom . ' ' . $request->user()->prenom;

        // Create notification for admins and supervisors
        $recipients = \App\Models\User::whereHas('role', function($q) {
            $q->whereIn('name', ['Admin', 'Supervisor']);
        })->get();

        foreach ($recipients as $recipient) {
            $recipient->notifications()->create([
                'id'   => (string) Str::uuid(),
                'type' => 'App\Notifications\ProblemReported',
                'data' => json_encode([
                    'message'    => "Problème signalé par $nomUser sur la tâche $taskId (Projet $nomProjet)",
                    'problem_id' => $problem->id,
                    'nom_projet' => $nomProjet,
                ]),
            ]);
        }

        return response()->json($problem->load(['project', 'task', 'user']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $problem = Problem::with(['project', 'user'])->findOrFail($id);
        if ($problem->user_id !== request()->user()->id && request()->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }
        return response()->json($problem);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $problem = Problem::findOrFail($id);
        if ($problem->user_id !== request()->user()->id && strtolower(request()->user()->role->name) !== 'admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $validated = $request->validate([
            'description' => 'sometimes|required|string',
            'resolved' => 'sometimes|boolean',
        ]);

        $wasResolved = $problem->resolved;
        $problem->update($validated);

        if (array_key_exists('resolved', $validated) && $validated['resolved'] && ! $wasResolved) {
            $problem->load(['project', 'task', 'user']);
            $message = "Le problème sur la tâche {$problem->task->task_id} du projet {$problem->project->nom_projet} a été résolu.";

            $recipients = \App\Models\User::whereHas('role', function ($q) {
                $q->whereIn('name', ['Admin', 'Supervisor']);
            })->get();

            if ($problem->user && ! $recipients->contains('id', $problem->user->id)) {
                $recipients->push($problem->user);
            }

            foreach ($recipients as $recipient) {
                $recipient->notifications()->create([
                    'id' => (string) Str::uuid(),
                    'type' => 'App\\Notifications\\ProblemReported',
                    'data' => json_encode([
                        'message' => $message,
                        'problem_id' => $problem->id,
                        'nom_projet' => $problem->project->nom_projet,
                    ]),
                ]);
            }
        }

        return response()->json($problem->load(['project', 'user']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $problem = Problem::findOrFail($id);
        if ($problem->user_id !== request()->user()->id && request()->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $problem->delete();
        return response()->json(null, 204);
    }
}
