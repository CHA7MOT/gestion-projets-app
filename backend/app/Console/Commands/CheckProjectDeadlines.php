<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use App\Notifications\ProjectDeadlineNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;
use App\Models\User;

class CheckProjectDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-project-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Checks for upcoming project deadlines and notifies assigned users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $projects = Project::with('users')->where('status', 'active')->get();
        $adminAndSupervisorUsers = User::whereHas('role', function($query) {
            $query->whereIn('name', ['Admin', 'Supervisor']);
        })->get();

        $today = now()->startOfDay();

        foreach ($projects as $project) {
            $endDate = Carbon::parse($project->contrat_end)->startOfDay();
            if ($endDate->greaterThanOrEqualTo($today)) {
                $daysRemaining = (int) $today->diffInDays($endDate, false); // Cast to int

                if (in_array($daysRemaining, [2, 1, 0])) {
                    $allUsers = $project->users->merge($adminAndSupervisorUsers)->unique('id');

                    $usersToNotify = $allUsers->filter(function ($user) use ($project, $daysRemaining) {
                        // Check if user already has this specific notification
                        return !$user->notifications()
                            ->where('type', ProjectDeadlineNotification::class)
                            ->where('data->project_id', $project->id)
                            ->where('data->days_remaining', $daysRemaining)
                            ->exists();
                    });

                    if ($usersToNotify->isNotEmpty()) {
                        Notification::send($usersToNotify, new ProjectDeadlineNotification($project, $daysRemaining));
                    }
                }
            }
        }
        
        $this->info('Project deadlines checked successfully.');
    }
}
