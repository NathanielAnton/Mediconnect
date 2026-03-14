# 👥 Comptes de test - MediConnect

## 🚀 Installation rapide

```bash
cd backend/laravel
php artisan migrate:fresh --seed
```

## 📋 Liste des comptes disponibles

### 🔐 Super Admin

- **Email**: `superadmin@mediconnect.com`
- **Mot de passe**: `password`
- **Rôle**: super-admin
- **Accès**: Gestion complète du système, assignation des rôles

---

### 👔 Admin

- **Email**: `admin.principal@mediconnect.com`
- **Mot de passe**: `password`
- **Rôle**: admin
- **Accès**: Administration générale

---

### 📊 Gestionnaire

- **Email**: `gestionnaire@mediconnect.com`
- **Mot de passe**: `password`
- **Rôle**: gestionnaire
- **Accès**: Gestion des ressources et statistiques

---

### 📝 Secrétaire

- **Email**: `secretaire@mediconnect.com`
- **Mot de passe**: `password`
- **Rôle**: secretaire
- **Accès**: Gestion des rendez-vous et plannings

---

### 👨‍⚕️ Médecins

#### Dr. Jean Dupont (Cardiologue)

- **Email**: `medecin1@mediconnect.com`
- **Mot de passe**: `password`
- **Spécialité**: Cardiologie
- **Téléphone**: 0612345678
- **Adresse**: 123 Rue de la Santé, Paris

#### Dr. Marie Martin (Dermatologue)

- **Email**: `medecin2@mediconnect.com`
- **Mot de passe**: `password`
- **Spécialité**: Dermatologie
- **Téléphone**: 0623456789
- **Adresse**: 456 Avenue des Médecins, Lyon

#### Dr. Pierre Dubois (Généraliste)

- **Email**: `medecin3@mediconnect.com`
- **Mot de passe**: `password`
- **Spécialité**: Médecine générale
- **Téléphone**: 0634567890
- **Adresse**: 789 Boulevard de la Médecine, Marseille

---

### 👤 Clients

- **Client 1**: `client1@mediconnect.com` / `password`
- **Client 2**: `client2@mediconnect.com` / `password`
- **Client 3**: `client3@mediconnect.com` / `password`
- **Client 4**: `client4@mediconnect.com` / `password`
- **Client 5**: `client5@mediconnect.com` / `password`

---

## 🧪 Scénarios de test

### Test 1: Connexion Super Admin

1. Connectez-vous avec `superadmin@mediconnect.com`
2. Accédez au dashboard super admin
3. Testez l'assignation de rôles

### Test 2: Médecin et son profil

1. Connectez-vous avec `medecin1@mediconnect.com`
2. Accédez au profil médecin
3. Configurez les horaires et le planning

### Test 3: Prise de rendez-vous

1. Connectez-vous avec `client1@mediconnect.com`
2. Recherchez un médecin
3. Prenez un rendez-vous

### Test 4: Gestion secrétariat

1. Connectez-vous avec `secretaire@mediconnect.com`
2. Gérez les rendez-vous
3. Consultez les plannings

---

## 🔄 Réinitialiser les données

```bash
cd backend/laravel
php artisan migrate:fresh --seed
```

Cela supprime toutes les données et recrée tous les comptes de test.

---

## 🛠️ Créer un compte manuellement

```bash
php artisan tinker
```

```php
$user = User::create([
    'name' => 'Nouveau Utilisateur',
    'email' => 'nouveau@example.com',
    'password' => bcrypt('password')
]);

$user->assignRole('medecin'); // ou 'client', 'admin', etc.
```

---

## 📊 Vérifier les comptes créés

```bash
php artisan roles:check
```

---

## ⚠️ IMPORTANT

**Ces mots de passe sont pour le développement uniquement !**

En production :

1. Changez tous les mots de passe
2. Supprimez les comptes de test
3. Utilisez des mots de passe forts
4. Activez la vérification par email

---

## 🎯 Commandes utiles

### Lister tous les utilisateurs

```bash
php artisan tinker
>>> User::with('roles')->get();
```

### Changer le mot de passe d'un utilisateur

```bash
php artisan tinker
>>> $user = User::where('email', 'superadmin@mediconnect.com')->first();
>>> $user->password = bcrypt('nouveau_password');
>>> $user->save();
```

### Assigner un nouveau rôle

```bash
php artisan user:assign-role email@example.com nom_role
```
