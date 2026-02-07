# 🚀 Guide d'installation et de test du Super Admin

## 📋 Étapes d'installation

### 1. Réinitialiser la base de données

```bash
cd backend/laravel

# Supprimer et recréer la base de données
php artisan migrate:fresh

# Lancer les seeders (crée automatiquement le super admin)
php artisan db:seed
```

Cela va créer :

- ✅ L'utilisateur **ID 1** avec le rôle **super-admin**
- ✅ Tous les rôles (client, medecin, admin, super-admin, gestionnaire, secretaire)
- ✅ Les spécialités médicales

### 2. Vérifier la création du Super Admin

```bash
php artisan roles:check
```

Vous devriez voir :

```
=== RÔLES EXISTANTS ===

📌 Rôle: super-admin (ID: 4)
   ✓ Super Admin (admin@mediconnect.com)
```

### 3. Connexion Super Admin

**Identifiants par défaut :**

- 📧 Email : `admin@mediconnect.com`
- 🔑 Mot de passe : `password`

⚠️ **IMPORTANT** : Changez ce mot de passe en production !

## 🧪 Test complet du système

### Test 1 : Connexion Super Admin

1. Démarrez le frontend et backend
2. Allez sur `/login`
3. Connectez-vous avec :
   - Email : `admin@mediconnect.com`
   - Password : `password`
4. Vous devriez être redirigé vers `/super-admin/dashboard`

### Test 2 : Assigner des rôles

Une fois connecté en tant que super admin :

1. Créez un nouvel utilisateur via `/register`
2. Dans le dashboard super admin, vous verrez le nouvel utilisateur
3. Sélectionnez l'utilisateur et assignez-lui un rôle (medecin, client, gestionnaire, etc.)
4. Déconnectez-vous
5. Reconnectez-vous avec le nouvel utilisateur
6. Vérifiez qu'il accède bien à son dashboard spécifique

### Test 3 : Vérifier les permissions

Testez qu'un utilisateur normal ne peut pas accéder au dashboard super admin :

```bash
# Via API directement
curl -X GET http://localhost:8000/api/super-admin/dashboard \
  -H "Authorization: Bearer <token_utilisateur_normal>"

# Devrait retourner : 403 Forbidden
```

## 🔧 Commandes utiles

### Créer un nouveau super admin manuellement

```bash
php artisan tinker
>>> $user = User::find(1); // Ou créez un nouvel utilisateur
>>> $user->syncRoles(['super-admin']);
>>> exit
```

### Assigner un rôle via ligne de commande

```bash
php artisan user:assign-role email@example.com super-admin
```

### Voir tous les utilisateurs et leurs rôles

```bash
php artisan roles:check
```

### Créer un nouvel utilisateur avec un rôle spécifique

```bash
php artisan tinker
>>> $user = User::create([
    'name' => 'Nouveau User',
    'email' => 'nouveau@example.com',
    'password' => bcrypt('password')
]);
>>> $user->assignRole('medecin');
>>> exit
```

## 📊 Structure des rôles

Voici la hiérarchie des rôles dans l'application :

```
super-admin  ← Accès total, gestion des utilisateurs et rôles
    ↓
admin        ← Administration générale
    ↓
gestionnaire ← Gestion des ressources
    ↓
secretaire   ← Secrétariat médical
    ↓
medecin      ← Gestion du planning et profil médical
    ↓
client       ← Prise de rendez-vous
```

## 🔐 Permissions par rôle

### Super Admin

- ✅ Voir tous les utilisateurs
- ✅ Assigner/modifier les rôles
- ✅ Créer de nouveaux rôles
- ✅ Accès à toutes les statistiques
- ✅ Gestion complète du système

### Admin

- ✅ Voir les utilisateurs
- ✅ Statistiques générales
- ⛔ Ne peut pas modifier les rôles

### Gestionnaire

- ✅ Voir les statistiques
- ✅ Gérer les ressources
- ⛔ Accès limité aux utilisateurs

### Secrétaire

- ✅ Gérer les rendez-vous
- ✅ Voir les plannings
- ⛔ Pas d'accès admin

### Médecin

- ✅ Gérer son profil
- ✅ Gérer son planning
- ✅ Voir ses rendez-vous
- ⛔ Ne voit que ses propres données

### Client

- ✅ Prendre des rendez-vous
- ✅ Voir ses rendez-vous
- ⛔ Accès le plus limité

## 🐛 Dépannage

### Problème : "Aucun rôle trouvé"

```bash
cd backend/laravel
php artisan db:seed --class=RoleSeeder
```

### Problème : "Utilisateur ID 1 n'existe pas"

```bash
php artisan migrate:fresh
php artisan db:seed
```

### Problème : "403 Forbidden" sur les routes super-admin

Vérifiez que l'utilisateur a bien le rôle :

```bash
php artisan tinker
>>> User::find(1)->roles;
```

### Problème : Frontend ne redirige pas vers le bon dashboard

Vérifiez que le rôle dans le token JWT correspond :

- Le backend renvoie `role: 'super-admin'` dans la réponse `/api/user`
- Le frontend lit correctement `user.role` dans AuthContext

## 📝 Modifier le mot de passe du Super Admin

```bash
php artisan tinker
>>> $user = User::find(1);
>>> $user->password = bcrypt('nouveau_mot_de_passe');
>>> $user->save();
>>> exit
```

## 🎯 Résumé rapide

**Pour tout réinitialiser et créer le super admin :**

```bash
cd backend/laravel
php artisan migrate:fresh --seed
```

**Pour se connecter :**

- Email : `admin@mediconnect.com`
- Password : `password`

C'est tout ! Le super admin est maintenant prêt à l'emploi. 🚀
