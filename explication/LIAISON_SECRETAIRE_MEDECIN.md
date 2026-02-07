# Système de Liaison Secrétaire-Médecin

## Vue d'ensemble

Ce système permet aux secrétaires d'envoyer des demandes de liaison aux médecins. Les médecins peuvent ensuite accepter ou refuser ces demandes. Une fois acceptées, les liaisons permettent aux secrétaires d'avoir un accès privilégié aux informations des médecins liés.

## Structure de la base de données

### Table: `secretaire_medecin`

```sql
CREATE TABLE secretaire_medecin (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    secretaire_id BIGINT UNSIGNED NOT NULL,
    medecin_id BIGINT UNSIGNED NOT NULL,
    statut ENUM('en_attente', 'accepte', 'refuse') DEFAULT 'en_attente',
    message TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (secretaire_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_liaison (secretaire_id, medecin_id)
);
```

**Champs:**
- `secretaire_id`: ID de l'utilisateur secrétaire
- `medecin_id`: ID de l'utilisateur médecin
- `statut`: État de la liaison (en_attente, accepte, refuse)
- `message`: Message optionnel du secrétaire lors de la demande
- `created_at`: Date de création de la demande
- `updated_at`: Date de dernière modification (acceptation/refus)

**Contraintes:**
- Une seule liaison par paire secrétaire-médecin (UNIQUE)
- Suppression en cascade si l'utilisateur est supprimé

## Modèle Eloquent

### Fichier: `app/Models/SecretaireMedecin.php`

**Relations:**
- `secretaire()`: Relation belongsTo vers User (role: secretaire)
- `medecin()`: Relation belongsTo vers User (role: medecin)

**Scopes:**
- `scopeEnAttente()`: Filtrer les liaisons en attente
- `scopeAcceptee()`: Filtrer les liaisons acceptées
- `scopeRefusee()`: Filtrer les liaisons refusées

**Utilisation:**
```php
// Récupérer toutes les liaisons acceptées d'un secrétaire
$liaisons = SecretaireMedecin::where('secretaire_id', $secretaire->id)
    ->acceptee()
    ->with('medecin')
    ->get();
```

## API Backend

### Routes Secrétaire (`/api/secretaire/*`)

#### 1. Envoyer une demande de liaison
```http
POST /api/secretaire/liaisons
Content-Type: application/json
Authorization: Bearer {token}

{
    "email": "medecin@example.com",
    "message": "Bonjour, je souhaiterais travailler avec vous"
}
```

**Réponse (201):**
```json
{
    "message": "Demande de liaison envoyée avec succès",
    "liaison": {
        "id": 1,
        "secretaire_id": 5,
        "medecin_id": 8,
        "statut": "en_attente",
        "message": "Bonjour, je souhaiterais travailler avec vous",
        "medecin": {
            "id": 8,
            "name": "Dr. Martin",
            "email": "medecin@example.com"
        }
    }
}
```

#### 2. Récupérer toutes les liaisons
```http
GET /api/secretaire/liaisons
Authorization: Bearer {token}
```

**Réponse:**
```json
{
    "liaisons": [
        {
            "id": 1,
            "statut": "accepte",
            "message": "Bonjour...",
            "created_at": "2024-01-15T10:30:00Z",
            "medecin": {
                "id": 8,
                "name": "Dr. Martin",
                "email": "medecin@example.com",
                "specialite": "Cardiologie",
                "telephone": "0601020304"
            }
        }
    ]
}
```

#### 3. Annuler une demande en attente
```http
DELETE /api/secretaire/liaisons/{id}
Authorization: Bearer {token}
```

#### 4. Récupérer les médecins liés (acceptés)
```http
GET /api/secretaire/medecins-lies
Authorization: Bearer {token}
```

### Routes Médecin (`/api/medecin/*`)

#### 1. Récupérer les demandes en attente
```http
GET /api/medecin/liaisons/demandes
Authorization: Bearer {token}
```

**Réponse:**
```json
{
    "demandes": [
        {
            "id": 1,
            "message": "Bonjour...",
            "created_at": "2024-01-15T10:30:00Z",
            "secretaire": {
                "id": 5,
                "name": "Sophie Dubois",
                "email": "sophie@example.com"
            }
        }
    ]
}
```

#### 2. Accepter une demande
```http
PATCH /api/medecin/liaisons/{id}/accepter
Authorization: Bearer {token}
```

#### 3. Refuser une demande
```http
PATCH /api/medecin/liaisons/{id}/refuser
Authorization: Bearer {token}
```

#### 4. Récupérer toutes les liaisons (historique)
```http
GET /api/medecin/liaisons
Authorization: Bearer {token}
```

#### 5. Récupérer les secrétaires liés
```http
GET /api/medecin/secretaires
Authorization: Bearer {token}
```

#### 6. Supprimer une liaison acceptée
```http
DELETE /api/medecin/liaisons/{id}
Authorization: Bearer {token}
```

## Interface Frontend

### 1. Page Secrétaire: SecretaireLiaisons

**Fichier:** `frontend/src/pages/secretaire/liaisons/SecretaireLiaisons.jsx`

**Fonctionnalités:**
- Formulaire pour envoyer une demande de liaison par email
- Message optionnel (500 caractères max)
- Liste de toutes les demandes avec leur statut
- Possibilité d'annuler les demandes en attente
- Badges colorés pour les statuts:
  - 🟡 En attente (orange)
  - 🟢 Accepté (vert)
  - 🔴 Refusé (rouge)

**Thème:** Orange (cohérent avec le dashboard secrétaire)

### 2. Page Médecin: MedecinLiaisons

**Fichier:** `frontend/src/pages/medecin/liaisons/MedecinLiaisons.jsx`

**Fonctionnalités:**
- Onglet "Nouvelles Demandes" avec compteur de notifications
- Onglet "Historique" avec toutes les liaisons
- Boutons Accepter/Refuser pour les demandes en attente
- Possibilité de supprimer une liaison acceptée
- Interface élégante avec cards et badges de statut

**Thème:** Bleu (cohérent avec le dashboard médecin)

## Workflow Complet

### Étape 1: Demande de liaison
1. Le secrétaire accède à `/secretaire/liaisons`
2. Il entre l'email du médecin et un message optionnel
3. Le système vérifie que l'email correspond à un médecin
4. Une liaison est créée avec `statut = 'en_attente'`

### Étape 2: Notification médecin
1. Le médecin accède à `/medecin/liaisons`
2. Il voit un badge rouge avec le nombre de nouvelles demandes
3. Il peut lire le message du secrétaire
4. Il peut accepter ou refuser la demande

### Étape 3: Liaison active
- Si acceptée: `statut = 'accepte'`
  - Le secrétaire voit le médecin dans "Médecins liés"
  - Les deux peuvent supprimer la liaison si nécessaire
  
- Si refusée: `statut = 'refuse'`
  - Le secrétaire peut renvoyer une nouvelle demande
  - L'ancienne demande refusée est écrasée

## Validation et Sécurité

### Contrôles Backend

**SecretaireController:**
- ✅ Vérification du rôle secrétaire
- ✅ Vérification que l'email existe
- ✅ Vérification que l'utilisateur est bien un médecin
- ✅ Prévention des doublons (unique constraint)
- ✅ Message limité à 500 caractères

**MedecinController:**
- ✅ Vérification du rôle médecin
- ✅ Vérification que la liaison appartient au médecin
- ✅ Vérification du statut avant action
- ✅ Protection contre les modifications non autorisées

### Middleware

Toutes les routes sont protégées par:
1. `auth:sanctum`: Authentification requise
2. `role:secretaire` ou `role:medecin`: Rôle approprié requis

## Intégration dans l'application

### Ajout dans le menu Secrétaire

```jsx
// Dans DashboardSecretaire.jsx
<nav>
  <button onClick={() => setActiveTab('overview')}>Vue d'ensemble</button>
  <button onClick={() => setActiveTab('medecins')}>Médecins</button>
  <button onClick={() => setActiveTab('liaisons')}>Mes Liaisons</button>
  <button onClick={() => setActiveTab('rdv')}>Rendez-vous</button>
  <button onClick={() => setActiveTab('patients')}>Patients</button>
</nav>

{activeTab === 'liaisons' && <SecretaireLiaisons />}
```

### Ajout dans le menu Médecin

```jsx
// Dans DashboardMedecin.jsx (à créer)
<nav>
  <button onClick={() => setActiveTab('overview')}>Vue d'ensemble</button>
  <button onClick={() => setActiveTab('planning')}>Planning</button>
  <button onClick={() => setActiveTab('liaisons')}>
    Liaisons
    {demandesCount > 0 && <span className="badge">{demandesCount}</span>}
  </button>
  <button onClick={() => setActiveTab('rdv')}>Rendez-vous</button>
</nav>

{activeTab === 'liaisons' && <MedecinLiaisons />}
```

## Tests

### Test manuel

1. **Connexion Secrétaire:**
   ```
   Email: secretaire@mediconnect.com
   Password: password
   ```

2. **Envoi de demande:**
   - Aller sur "Mes Liaisons"
   - Entrer l'email: `medecin1@mediconnect.com`
   - Ajouter un message
   - Envoyer

3. **Connexion Médecin:**
   ```
   Email: medecin1@mediconnect.com
   Password: password
   ```

4. **Validation:**
   - Aller sur "Liaisons"
   - Voir la nouvelle demande (badge rouge)
   - Accepter ou refuser

### Cas d'erreur à tester

- ❌ Email inexistant → "Aucun utilisateur trouvé"
- ❌ Email d'un non-médecin → "Cet utilisateur n'est pas un médecin"
- ❌ Demande en double → "Une demande est déjà en attente"
- ❌ Liaison déjà acceptée → "Vous êtes déjà lié(e) à ce médecin"

## Évolutions futures

### Notifications en temps réel
- Intégrer Laravel Echo + Pusher
- Notification instantanée au médecin lors d'une nouvelle demande
- Notification au secrétaire lors d'une acceptation/refus

### Permissions avancées
- Limiter l'accès aux données en fonction de la liaison
- Secrétaires ne voient que les rendez-vous de leurs médecins liés

### Statistiques
- Nombre de liaisons par médecin
- Taux d'acceptation des demandes
- Historique des modifications

### Multi-médecins
- Un secrétaire peut être lié à plusieurs médecins
- Gestion de plusieurs cabinets

## Commandes utiles

```bash
# Exécuter la migration
php artisan migrate

# Voir les liaisons en cours
php artisan tinker
>>> SecretaireMedecin::with(['secretaire', 'medecin'])->get();

# Créer une liaison manuellement
>>> SecretaireMedecin::create([
    'secretaire_id' => 5,
    'medecin_id' => 8,
    'statut' => 'accepte'
]);

# Compter les demandes en attente pour un médecin
>>> User::find(8)->liaisonsSecretairesMedecin()->enAttente()->count();
```

## Fichiers créés

### Backend
- ✅ `database/migrations/2026_02_07_105630_create_secretaire_medecin_table.php`
- ✅ `app/Models/SecretaireMedecin.php`
- ✅ `app/Http/Controllers/MedecinController.php` (nouveau)
- ✅ Méthodes ajoutées à `SecretaireController.php`
- ✅ Routes ajoutées dans `routes/api.php`

### Frontend
- ✅ `frontend/src/pages/secretaire/liaisons/SecretaireLiaisons.jsx`
- ✅ `frontend/src/pages/secretaire/liaisons/SecretaireLiaisons.css`
- ✅ `frontend/src/pages/medecin/liaisons/MedecinLiaisons.jsx`
- ✅ `frontend/src/pages/medecin/liaisons/MedecinLiaisons.css`

---

**Date de création:** 7 février 2026  
**Version:** 1.0  
**Auteur:** Système MediConnect
