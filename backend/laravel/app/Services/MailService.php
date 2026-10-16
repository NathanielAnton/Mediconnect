<?php

namespace App\Services;

use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use RuntimeException;

class MailService
{
    private const ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

    /**
     * Envoie un email transactionnel via l'API Brevo.
     *
     * Options :
     * - html / text : contenu (au moins un des deux)
     * - cc / bcc : adresses en string ou ['email' => ..., 'name' => ...]
     * - attachments : chemins de fichiers en string ou ['path' => ..., 'name' => ...]
     * - scheduled_at : date d'envoi differe (DateTimeInterface ou string)
     * - sender : ['email' => ..., 'name' => ...] (email par defaut : config mail.from.address)
     *
     * @param  array<int, string|array{email: string, name?: string}>|string  $to
     * @return array<string, mixed> Reponse Brevo (messageId)
     */
    public function send(array|string $to, string $subject, array $options = []): array
    {
        $apiKey = config('services.brevo.key');
        if (! $apiKey) {
            throw new RuntimeException('BREVO_API_KEY est absent du fichier .env.');
        }

        $recipients = $this->recipients($to);
        if (empty($recipients)) {
            throw new InvalidArgumentException('Au moins un destinataire est requis.');
        }

        if (empty($options['html']) && empty($options['text'])) {
            throw new InvalidArgumentException('Le contenu (html ou text) est requis.');
        }

        $payload = [
            'sender' => $this->sender($options['sender'] ?? null),
            'to' => $recipients,
            'subject' => $subject,
        ];

        if (! empty($options['cc'])) {
            $payload['cc'] = $this->recipients($options['cc']);
        }

        if (! empty($options['bcc'])) {
            $payload['bcc'] = $this->recipients($options['bcc']);
        }

        if (! empty($options['html'])) {
            $payload['htmlContent'] = $options['html'];
        }

        if (! empty($options['text'])) {
            $payload['textContent'] = $options['text'];
        }

        if (! empty($options['attachments'])) {
            $payload['attachment'] = $this->attachments($options['attachments']);
        }

        if (! empty($options['scheduled_at'])) {
            $payload['scheduledAt'] = $this->scheduledAt($options['scheduled_at']);
        }

        $response = Http::withHeaders([
            'api-key' => $apiKey,
            'accept' => 'application/json',
        ])
            ->timeout(15)
            ->post(self::ENDPOINT, $payload);

        if ($response->failed()) {
            throw new RuntimeException('Echec envoi Brevo ('.$response->status().') : '.$response->body());
        }

        return $response->json() ?? [];
    }

    /**
     * @return array<int, array{email: string, name?: string}>
     */
    private function recipients(array|string $list): array
    {
        if (is_string($list) || isset($list['email'])) {
            $list = [$list];
        }

        return array_values(array_map(function (string|array $item): array {
            $contact = is_string($item) ? ['email' => $item] : $item;

            if (! filter_var($contact['email'] ?? null, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException('Adresse email invalide : '.json_encode($contact['email'] ?? null));
            }

            return array_filter([
                'email' => $contact['email'],
                'name' => $contact['name'] ?? null,
            ]);
        }, $list));
    }

    /**
     * @return array{email: string|null, name?: string}
     */
    private function sender(?array $sender): array
    {
        return array_filter([
            'email' => $sender['email'] ?? "noreply@medi-connect.info",
            'name' => $sender['name'] ?? null,
        ]);
    }

    /**
     * @param  array<int, string|array{path: string, name?: string}>  $files
     * @return array<int, array{name: string, content: string}>
     */
    private function attachments(array $files): array
    {
        return array_values(array_map(function (string|array $file): array {
            $path = is_string($file) ? $file : ($file['path'] ?? '');

            if (! is_file($path)) {
                throw new InvalidArgumentException('Piece jointe introuvable : '.$path);
            }

            return [
                'name' => is_string($file) ? basename($path) : ($file['name'] ?? basename($path)),
                'content' => base64_encode(file_get_contents($path)),
            ];
        }, $files));
    }

    private function scheduledAt(DateTimeInterface|string $date): string
    {
        $date = Carbon::parse($date);

        if ($date->isPast()) {
            throw new InvalidArgumentException('La date d\'envoi doit etre dans le futur.');
        }

        return $date->toIso8601String();
    }
}
