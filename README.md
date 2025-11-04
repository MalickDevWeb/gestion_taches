# NestJS API for Transfer Management

A comprehensive NestJS application for managing financial transfers, users, and tasks with built-in audit logging, API key authentication, and Swagger documentation.

## Features

- **Transfer Management**: Create, read, update, and track transfer statuses with comprehensive audit trails
- **User Management**: Full CRUD operations for user entities
- **Task Management**: Basic task tracking functionality
- **Audit Logging**: Automatic logging of all transfer operations with before/after values
- **API Key Authentication**: Secure access control for sensitive endpoints
- **Swagger Documentation**: Interactive API documentation at `/docs`
- **PostgreSQL Integration**: Database persistence with Neon hosting
- **Validation & Transformation**: Input validation using class-validator and class-transformer

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- PostgreSQL database (Neon recommended for cloud hosting)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd apprendre_nest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

## Environment Variables

The application requires the following environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `API_KEY` | API key for authenticating requests to transfers endpoints | Yes | - |
| `PORT` | Server port | No | 3001 |

## Database Setup

### Using Neon (Recommended)

1. Create a Neon account at https://neon.tech
2. Create a new project and database
3. Copy the connection string from the dashboard
4. Set it as `DATABASE_URL` in your `.env` file

### Manual Database Setup

If you prefer local PostgreSQL:

```bash
# Create database
createdb transfer_api

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/transfer_api"
```

## Database Migrations

### Running Migrations

```bash
# Apply all pending migrations
npm run migration:run

# Or with npx
npx typeorm migration:run
```

### Creating New Migrations

```bash
# Create a new migration file
npx typeorm migration:create src/migrations/YourMigrationName

# Example for creating a new table
npx typeorm migration:create src/migrations/CreateNewTable
```

### Migration Status

```bash
# Check migration status
npx typeorm migration:show

# Revert last migration
npx typeorm migration:revert
```

### Seeding Data

```bash
# Run seeders to populate database with test data
npm run seed

# Or manually
npx ts-node src/database/seed.ts
```

### Database Commands

```bash
# Connect to database directly (replace with your connection string)
psql 'postgresql://neondb_owner:npg_rhmzYEV8FSJ0@ep-royal-dream-ah8vtbw9.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Check tables
psql 'your-connection-string' -c "\dt"

# Count records in transfers table
psql 'your-connection-string' -c "SELECT COUNT(*) FROM transfers;"

# View sample transfer data
psql 'your-connection-string' -c "SELECT reference, recipient->>'name' as name, amount, status FROM transfers LIMIT 5;"
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3001` (or your configured PORT).

## API Documentation

Once running, visit `http://localhost:3001/docs` for interactive Swagger documentation.

## API Endpoints

All endpoints are prefixed with `/api`. Transfers endpoints require API key authentication.

### Transfers (`/api/transfers`)

**Authentication**: Required (API Key in `x-api-key` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transfers` | Create a new transfer |
| GET | `/api/transfers` | Get all transfers (with optional filters) |
| GET | `/api/transfers/:id` | Get transfer by ID |
| PATCH | `/api/transfers/:id` | Update transfer status |
| POST | `/api/transfers/:id/process` | Process transfer |
| POST | `/api/transfers/:id/cancel` | Cancel transfer |
| GET | `/api/transfers/:id/audit` | Get audit logs for transfer |

### Users (`/api/users`)

**Authentication**: None required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Tasks (`/api/tasks`)

**Authentication**: None required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get task by ID |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## Usage Examples

### Creating a Transfer (Requires API Key)
```bash
curl -X POST http://localhost:3001/api/transfers \
  -H "Content-Type: application/json" \
  -H "x-api-key: dexchange-api-key-2025" \
  -d '{
    "amount": 12500,
    "currency": "XOF",
    "channel": "WAVE",
    "recipient": {
      "phone": "+221770000000",
      "name": "Jane Doe"
    },
    "metadata": { "orderId": "ABC-123" }
  }'
```

### Getting All Transfers with Filters
```bash
curl "http://localhost:3001/api/transfers?status=PENDING&limit=10" \
  -H "x-api-key: dexchange-api-key-2025"
```

### Creating a User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

### Processing a Transfer
```bash
curl -X POST http://localhost:3001/api/transfers/{transfer-id}/process \
  -H "x-api-key: dexchange-api-key-2025"
```

### Cancelling a Transfer
```bash
curl -X POST http://localhost:3001/api/transfers/{transfer-id}/cancel \
  -H "x-api-key: dexchange-api-key-2025"
```

### Getting Transfer Audit Logs
```bash
curl http://localhost:3001/api/transfers/123/audit \
  -H "x-api-key: dexchange-api-key-2025"
```

## Troubleshooting

### Erreur "exports is not defined"
Si vous obtenez cette erreur, c'est probablement un problème de modules. Assurez-vous que :
1. Votre `tsconfig.json` utilise `"module": "nodenext"` ou `"module": "commonjs"`
2. Le client Prisma est régénéré après les changements de configuration

### Erreur de connexion à la base de données
1. Vérifiez que votre `DATABASE_URL` dans `.env` est correcte
2. Assurez-vous que votre base Neon accepte les connexions depuis votre IP
3. Vérifiez que le SSL est activé (`sslmode=require`)

### Le serveur ne démarre pas
1. Vérifiez les logs de démarrage pour les erreurs TypeScript
2. Assurez-vous que tous les imports sont corrects
3. Vérifiez que le client Prisma est généré

## Available Scripts

```bash
# Development
npm run start:dev          # Start development server with hot reload
npm run start:debug        # Start with debugger
npm run build             # Build for production
npm run start:prod        # Start production server

# Database
npm run migration:run     # Apply all pending migrations
npm run migration:revert  # Revert last migration
npm run seed              # Populate database with test data

# Testing
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run end-to-end tests

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

## Migration Files

The project includes the following migration files:

- `1762158709510-CreateUsersTable.ts` - Creates users table
- `1762158714973-CreateTransfersTable.ts` - Creates transfers table with enum
- `1762213850336-CreateSenegaleseTransfersTable.ts` - Optimized transfers table with indexes and seed data
- `1762213934984-SeedSenegaleseTransfers.ts` - Additional Senegalese test data

## Business Rules

### Transfer Fees Calculation
- Fee = 0.8% of amount (rounded up)
- Minimum fee: 100
- Maximum fee: 1500
- Total = amount + fees

### Transfer Status Flow
```
PENDING → PROCESSING → SUCCESS | FAILED
PENDING → CANCELLED
```

### Processing Simulation
- 70% success rate
- 30% failure rate
- Processing delay: 2 seconds

### State Transitions
- Only PENDING transfers can be processed or cancelled
- COMPLETED, FAILED, and CANCELLED are final states

## Sécurité

- Ne commitez jamais votre fichier `.env` avec des informations sensibles
- Utilisez des variables d'environnement pour toutes les configurations sensibles
- Activez le SSL pour les connexions à la base de données en production
