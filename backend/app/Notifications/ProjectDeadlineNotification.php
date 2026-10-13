<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Project;

class ProjectDeadlineNotification extends Notification
{
    use Queueable;

    public $project;
    public $daysRemaining;

    /**
     * Create a new notification instance.
     */
    public function __construct(Project $project, int $daysRemaining)
    {
        $this->project = $project;
        $this->daysRemaining = $daysRemaining;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'project_id' => $this->project->id,
            'nom_projet' => $this->project->nom_projet,
            'days_remaining' => $this->daysRemaining,
            'message' => "Le projet '{$this->project->nom_projet}' se termine dans {$this->daysRemaining} jour(s)."
        ];
    }
}
