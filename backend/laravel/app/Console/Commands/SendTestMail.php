<?php

namespace App\Console\Commands;

use App\Services\MailService;
use Illuminate\Console\Command;
use Throwable;

class SendTestMail extends Command
{
    protected $signature = 'mail:test';

    protected $description = 'Envoie un email de test via le service Brevo';

    public function handle(MailService $mail): int
    {
        $to = "teamlead.mediconnect@gmail.com";
        $sender = ['email' => "noreply@medi-connect.info", 'name' => 'MediConnect'];
        $subject = 'Test envoi Brevo';
        $htmlContent = view('emails.test')->render();
        $textContent = 'Ceci est un email de test envoye via l\'API Brevo.';

        try {
            $response = $mail->send(
                to: $to,
                subject: $subject,
                options: [
                    'sender' => $sender,
                    'html' => $htmlContent,
                    'text' => $textContent,
                    'cc' => [],
                    'bcc' => [],
                    'attachments' => [],
                    'scheduled_at' => null,
                ],
            );
        } catch (Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
        // $this->info('Response from Brevo : '.json_encode($response));

        $this->info('Requete acceptee par Brevo. messageId : '.($response['messageId'] ?? 'inconnu'));

        return self::SUCCESS;
    }
}
