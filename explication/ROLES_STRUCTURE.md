# 🔐 Structure des Rôles et Permissions - Spatie Laravel Permission

## 📊 Tables créées dans la base de données

Le package Spatie crée **5 tables** pour gérer les rôles et permissions :

### 1. **`roles`** - Table des rôles

Contient tous les rôles disponibles (admin, medecin, client, gestionnaire, etc.)

```sql
+----+---------------+------------+
| id | name          | guard_name |
+----+---------------+------------+
| 1  | admin         | web        |
| 2  | medecin       | web        |
| 3  | client        | web        |
| 4  | gestionnaire  | web        |
+----+---------------+------------+
```

### 2. **`permissions`** - Table des permissions

Contient les permissions spécifiques (view-users, edit-posts, etc.)

```sql
+----+------------------+------------+
| id | name             | guard_name |
+----+------------------+------------+
| 1  | view-dashboard   | web        |
| 2  | manage-users     | web        |
| 3  | edit-appointments| web        |
+----+------------------+------------+
```

### 3. **`model_has_roles`** ⭐ LA PLUS IMPORTANTE

**C'est la table pivot qui lie les utilisateurs aux rôles !**

```sql
+---------+------------+------------------+
| role_id | model_type | model_id (user_id)|
+---------+------------+------------------+
| 2       | App\Models\User | 5             |  ← L'utilisateur 5 est médecin
| 3       | App\Models\User | 10            |  ← L'utilisateur 10 est client
| 4       | App\Models\User | 15            |  ← L'utilisateur 15 est gestionnaire
+---------+------------+------------------+
```

### 4. **`model_has_permissions`**

Lie les permissions directement aux utilisateurs (sans passer par les rôles)

```sql
+---------------+------------+------------------+
| permission_id | model_type | model_id         |
+---------------+------------+------------------+
| 1             | App\Models\User | 8          |
+---------------+------------+------------------+
```

### 5. **`role_has_permissions`**

Lie les permissions aux rôles (un rôle peut avoir plusieurs permissions)

```sql
+---------+---------------+
| role_id | permission_id |
+---------+---------------+
| 1       | 1             |  ← Le rôle admin a la permission view-dashboard
| 1       | 2             |  ← Le rôle admin a la permission manage-users
| 2       | 1             |  ← Le rôle medecin a la permission view-dashboard
+---------+---------------+
```

## 🔗 Comment ça fonctionne

```
┌─────────────┐
│   users     │
│  id | name  │
│  1  | John  │
│  2  | Marie │
└──────┬──────┘
       │
       │ Lié via model_has_roles
       ↓
┌──────────────────────┐
│  model_has_roles     │
│ role_id | model_id   │
│    2    |     1      │ ← John (user 1) a le rôle 2
│    3    |     2      │ ← Marie (user 2) a le rôle 3
└──────────┬───────────┘
           │
           │ Fait référence à
           ↓
    ┌──────────────┐
    │    roles     │
    │ id |  name   │
    │ 2  | medecin │
    │ 3  | client  │
    └──────────────┘
```

## 🛠️ Vérifier dans votre base de données

### 1. Vérifier si les tables existent

```bash
cd backend/laravel
php artisan migrate:status
```

Si les migrations ne sont pas exécutées :

```bash
php artisan migrate
```

### 2. Voir tous les rôles existants

```sql
SELECT * FROM roles;
```

Ou en Artisan Tinker :

```bash
php artisan tinker
>>> Spatie\Permission\Models\Role::all();
```

### 3. Voir quel utilisateur a quel rôle

```sql
SELECT
    users.id,
    users.name,
    users.email,
    roles.name as role_name
FROM users
JOIN model_has_roles ON users.id = model_has_roles.model_id
JOIN roles ON model_has_roles.role_id = roles.id
WHERE model_has_roles.model_type = 'App\\Models\\User';
```

Ou en Tinker :

```bash
php artisan tinker
>>> User::with('roles')->get();
```

### 4. Voir les rôles d'un utilisateur spécifique

```bash
php artisan tinker
>>> $user = User::find(1);
>>> $user->roles;  # Affiche tous les rôles
>>> $user->getRoleNames();  # Affiche les noms des rôles
```

## 💻 Commandes utiles

### Créer un rôle

```bash
php artisan tinker
>>> use Spatie\Permission\Models\Role;
>>> Role::create(['name' => 'gestionnaire']);
>>> Role::create(['name' => 'secretaire']);
```

### Assigner un rôle à un utilisateur

```bash
php artisan user:assign-role user@example.com gestionnaire
```

Ou en Tinker :

```bash
php artisan tinker
>>> $user = User::where('email', 'user@example.com')->first();
>>> $user->assignRole('gestionnaire');
```

### Retirer un rôle

```bash
php artisan tinker
>>> $user = User::find(1);
>>> $user->removeRole('client');
```

### Changer de rôle (remplacer tous les rôles)

```bash
php artisan tinker
>>> $user = User::find(1);
>>> $user->syncRoles(['gestionnaire']); # Retire tous les anciens rôles et assigne gestionnaire
```

## 🔍 Vérification rapide

Pour voir la structure complète dans votre base de données :

```bash
# Via MySQL/MariaDB
mysql -u root -p mediconnect
SHOW TABLES;
DESCRIBE model_has_roles;
SELECT * FROM model_has_roles;
```

## 📝 Résumé

- **`users`** : Vos utilisateurs
- **`roles`** : Les rôles disponibles (admin, medecin, client, gestionnaire)
- **`model_has_roles`** : ⭐ **La table qui lie users ↔ roles**
- **`permissions`** : Permissions granulaires (optionnel, peut être vide)
- **`model_has_permissions`** : Lie users ↔ permissions directement
- **`role_has_permissions`** : Lie roles ↔ permissions

La magie se passe dans **`model_has_roles`** ! C'est cette table qui stocke qui a quel rôle. 🎯
