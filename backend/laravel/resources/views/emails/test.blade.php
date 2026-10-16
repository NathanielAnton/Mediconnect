@extends('emails.base')

@section('title', 'Test envoi Brevo')

@section('content')
    <h2 style="margin:0 0 16px; font-size:18px; color:#222222;">Bonjour,</h2>
    <p style="margin:0 0 16px; font-size:15px; line-height:1.5;">
        Ceci est un email de test envoye via l'API Brevo.
    </p>
    <p style="margin:0; font-size:15px; line-height:1.5;">
        Si vous recevez ce message, la configuration d'envoi fonctionne correctement.
    </p>
@endsection
