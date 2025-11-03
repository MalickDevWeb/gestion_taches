# 🚀 Guide de Déploiement DEXCHANGE API

## 📋 Prérequis

- Compte [Render](https://render.com) (gratuit pour commencer)
- GitHub repository avec votre code
- Docker installé localement (pour les tests)

## 🐳 Déploiement Local avec Docker

### 1. Construction de l'image
```bash
# Construire l'image Docker
docker build -t dexchange-app .

# Vérifier que l'image est créée
docker images | grep dexchange
```

### 2. Test avec Docker Compose
```bash
# Lancer tous les services
docker-compose up -d

# Vérifier que les conteneurs tournent
docker-compose ps

# Voir les logs
docker-compose logs -f app

# Tester l'API
curl http://localhost:3001/api/v1/papamalickteuw/users
```

### 3. Arrêter les services
```bash
docker-compose down
```

## 🌐 Déploiement sur Render

### 1. Préparation du Repository

1. **Push votre code sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Vérifiez que tous les fichiers sont présents** :
   - `Dockerfile`
   - `render.yaml`
   - `package.json`
   - `src/` (code source)
   - `dist/` (build)
   - `migrations/` (migrations TypeORM)

### 2. Configuration sur Render

#### **Option A : Déploiement Automatique (Recommandé)**

1. **Connectez votre compte GitHub à Render**
   - Allez sur [dashboard.render.com](https://dashboard.render.com)
   - Cliquez sur "New" → "Blueprint"
   - Connectez votre repository GitHub

2. **Render détectera automatiquement `render.yaml`**
   - Il créera automatiquement :
     - Service web pour l'API
     - Base de données PostgreSQL
     - Service Redis
   - Les variables d'environnement seront configurées automatiquement

#### **Option B : Déploiement Manuel**

1. **Créer la base de données PostgreSQL**
   - New → PostgreSQL
   - Nom : `dexchange-db`
   - Région : Sélectionnez la plus proche (EU-West pour l'Europe)

2. **Créer le service Redis**
   - New → Redis
   - Nom : `dexchange-redis`
   - Région : Même région que la DB

3. **Créer le service Web**
   - New → Web Service
   - Connectez votre repository GitHub
   - **Runtime** : `Docker`
   - **Build Command** : Vide (utilise le Dockerfile)
   - **Start Command** : Vide (utilise le CMD du Dockerfile)

4. **Variables d'environnement** :
   ```
   NODE_ENV=production
   DB_TYPE=postgres
   DB_HOST=<votre-db-host>
   DB_PORT=5432
   DB_USERNAME=<votre-db-user>
   DB_PASSWORD=<votre-db-password>
   DB_NAME=dexchange_db
   API_KEY=<générez-une-clé-api-sécurisée>
   REDIS_HOST=<votre-redis-host>
   REDIS_PORT=6379
   PORT=10000
   ```

### 3. Migration de la Base de Données

Après le premier déploiement, exécutez les migrations :

```bash
# Via Render Shell (si disponible) ou connectez-vous à votre DB
# Les migrations tourneront automatiquement au démarrage
```

### 4. Vérification du Déploiement

1. **URL de l'API** : `https://votre-service.render.com`
2. **Test de santé** :
   ```bash
   curl https://votre-service.render.com/api/v1/papamalickteuw/users
   ```
3. **Swagger Documentation** : `https://votre-service.render.com/docs`

## 🔧 Configuration Avancée

### Variables d'Environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `NODE_ENV` | Environnement | `production` |
| `DB_TYPE` | Type de DB | `postgres` |
| `DB_HOST` | Host de la DB | - |
| `DB_PORT` | Port de la DB | `5432` |
| `DB_USERNAME` | User DB | - |
| `DB_PASSWORD` | Password DB | - |
| `DB_NAME` | Nom de la DB | `dexchange_db` |
| `API_KEY` | Clé d'API | Générée automatiquement |
| `REDIS_HOST` | Host Redis | - |
| `REDIS_PORT` | Port Redis | `6379` |
| `PORT` | Port de l'app | `10000` |

### Monitoring

- **Logs** : Disponibles dans le dashboard Render
- **Health Check** : Automatique via le Dockerfile
- **Métriques** : CPU, RAM, etc. dans le dashboard

## 🚨 Dépannage

### Problèmes Courants

1. **Erreur de build Docker**
   ```bash
   # Testez localement d'abord
   docker build -t dexchange-app .
   docker run -p 3001:3001 dexchange-app
   ```

2. **Erreur de connexion DB**
   - Vérifiez les variables d'environnement
   - Assurez-vous que la DB est accessible

3. **Migrations qui ne tournent pas**
   ```bash
   # Forcer les migrations en prod
   NODE_ENV=production npm run migration:run
   ```

### Support

- **Documentation Render** : [docs.render.com](https://docs.render.com)
- **Logs d'application** : Dashboard Render → Service → Logs
- **Variables d'env** : Dashboard Render → Service → Environment

## 🎯 Checklist de Déploiement

- [ ] Code poussé sur GitHub
- [ ] `render.yaml` configuré
- [ ] `Dockerfile` optimisé
- [ ] Variables d'environnement définies
- [ ] Base de données créée
- [ ] Redis configuré
- [ ] Service web déployé
- [ ] API testée et fonctionnelle
- [ ] Migrations exécutées
- [ ] Données seedées (optionnel)

---

**🎉 Votre API DEXCHANGE est maintenant déployée et prête à recevoir des requêtes !**
