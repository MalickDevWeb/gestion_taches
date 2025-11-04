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

## Testing API Endpoints

### Prerequisites
```bash
# Start the application in development mode
npm run start:dev

# Or in production mode
npm run build
npm run start:prod

# The API will be available at http://localhost:3001
# Swagger documentation at http://localhost:3001/docs
```

### 1. Creating a Transfer
```bash
curl -X POST http://localhost:3001/api/v1/papamalickteuw/transfers \
  -H "Content-Type: application/json" \
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

# Expected Response: 201 Created
# Returns transfer object with generated reference, fees, and status: "PENDING"
```

### 2. Getting All Transfers (with optional filters)
```bash
# Get all transfers
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers"

# With filters
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers?status=PENDING&limit=10"

# Search by reference or recipient name
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers?q=TRF-20250101"

# Filter by amount range
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers?minAmount=10000&maxAmount=50000"

# Filter by channel
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers?channel=WAVE"

# Expected Response: 200 OK
# Returns: { "items": [...], "nextCursor": "..." }
```

### 3. Getting a Transfer by ID
```bash
# Replace {transfer-id} with actual ID from creation response
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers/{transfer-id}"

# Expected Response: 200 OK or 404 Not Found
```

### 4. Processing a Transfer
```bash
# Replace {transfer-id} with actual ID
curl -X POST "http://localhost:3001/api/v1/papamalickteuw/transfers/{transfer-id}/process"

# Expected Response: 200 OK
# Status changes: PENDING → PROCESSING → SUCCESS (70%) or FAILED (30%)
# Returns updated transfer object
```

### 5. Cancelling a Transfer
```bash
# Replace {transfer-id} with actual ID
curl -X POST "http://localhost:3001/api/v1/papamalickteuw/transfers/{transfer-id}/cancel"

# Expected Response: 200 OK or 409 Conflict (if not PENDING)
# Status changes: PENDING → CANCELLED
```

### 6. Getting Transfer Audit Logs
```bash
# Replace {transfer-id} with actual ID
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers/{transfer-id}/audit"

# Expected Response: 200 OK
# Returns array of audit log entries
```

### 7. Testing Users Endpoints
```bash
# Create a user
curl -X POST http://localhost:3001/api/v1/papamalickteuw/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'

# Get all users
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/users"

# Expected Response: 200 OK
```

### 8. Testing with Production Database (Render)
```bash
# Replace with your actual deployed URL
BASE_URL="https://your-app-name.onrender.com"

# Test transfers endpoint
curl -X GET "$BASE_URL/api/v1/papamalickteuw/transfers"

# Test users endpoint (health check)
curl -X GET "$BASE_URL/api/v1/papamalickteuw/users"

# Expected: Should return data from your Render PostgreSQL database
```

### 9. Testing Error Cases
```bash
# Try to get non-existent transfer
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers/non-existent-id"
# Expected: 404 Not Found

# Try to process already processed transfer
curl -X POST "http://localhost:3001/api/v1/papamalickteuw/transfers/{processed-id}/process"
# Expected: 409 Conflict

# Try to cancel completed transfer
curl -X POST "http://localhost:3001/api/v1/papamalickteuw/transfers/{completed-id}/cancel"
# Expected: 409 Conflict
```

### 10. Testing Pagination
```bash
# Get first page (default limit: 10)
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers?limit=5"

# Get next page using cursor
curl -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers?limit=5&cursor=eyJpZCI6IjEwIn0"

# Expected: Cursor-based pagination working correctly
```

### 11. Testing Business Rules
```bash
# Test fee calculation (0.8% of 12500 = 100, min fee = 100)
curl -X POST http://localhost:3001/api/v1/papamalickteuw/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 12500,
    "currency": "XOF",
    "channel": "WAVE",
    "recipient": {
      "phone": "+221770000000",
      "name": "Test User"
    }
  }'
# Expected: fees = 100, total = 12600

# Test high amount fee cap (0.8% of 200000 = 1600, but max fee = 1500)
curl -X POST http://localhost:3001/api/v1/papamalickteuw/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200000,
    "currency": "XOF",
    "channel": "WAVE",
    "recipient": {
      "phone": "+221770000000",
      "name": "High Amount User"
    }
  }'
# Expected: fees = 1500, total = 201500
```

### 12. Testing Swagger Documentation
```bash
# Open in browser
open http://localhost:3001/docs

# Or with curl to check if accessible
curl -s http://localhost:3001/docs | head -20
# Expected: HTML content of Swagger UI
```

### 13. Testing Docker Production Build
```bash
# Build the image
docker build -t dexchange-app:test .

# Run in production mode
docker run -d --name dexchange-test -p 10000:10000 \
  -e NODE_ENV=production \
  -e PORT=10000 \
  -e DATABASE_URL="your-database-url" \
  dexchange-app:test

# Test the containerized API
curl -X GET "http://localhost:10000/api/v1/papamalickteuw/transfers"

# Clean up
docker stop dexchange-test
docker rm dexchange-test
```

### 14. Testing Database Connection
```bash
# Check if migrations ran successfully
npm run migration:run

# Check database content
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM transfers;"

# Check if seed data exists
psql "$DATABASE_URL" -c "SELECT reference, status, amount FROM transfers LIMIT 3;"
```

### 15. Performance Testing
```bash
# Simple load test with multiple requests
for i in {1..10}; do
  curl -s -X GET "http://localhost:3001/api/v1/papamalickteuw/transfers" > /dev/null &
done
wait
echo "Load test completed"
```

## Common Issues & Solutions

### Issue: "API key is required" error
**Solution**: Remove `@UseGuards(ApiKeyGuard)` from controller or add API key header

### Issue: "relation 'transfers' does not exist"
**Solution**: Run migrations first
```bash
npm run migration:run
```

### Issue: Port already in use
**Solution**: Change port in `.env` or kill process using the port
```bash
lsof -ti:3001 | xargs kill -9
```

### Issue: Database connection failed
**Solution**: Check `DATABASE_URL` in `.env` file and ensure database is accessible

### Issue: Swagger not loading
**Solution**: Ensure app is running and visit `http://localhost:3001/docs`

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

## Deployment on Render

### Prerequisites

1. **Render Account**: Create an account at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to a GitHub repository

### Deployment Steps

1. **Connect Repository**:
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository

2. **Deploy with Blueprint**:
   - Render will automatically detect the `render.yaml` file
   - It will create:
     - **Web Service**: Your NestJS API
     - **PostgreSQL Database**: Persistent data storage
     - **Redis**: For BullMQ queues

3. **Environment Variables**:
   - Render will automatically generate:
     - `API_KEY`: Random secure key for authentication
     - Database credentials
     - Redis connection details

4. **Access Your API**:
   - After deployment, you'll get a URL like: `https://dexchange-api.onrender.com`
   - API documentation: `https://dexchange-api.onrender.com/docs`
   - Health check: `https://dexchange-api.onrender.com/api/v1/papamalickteuw/users`

### Manual Deployment (Alternative)

If you prefer manual setup:

1. **Create PostgreSQL Database**:
   - Go to Render → New → PostgreSQL
   - Note the connection details

2. **Create Redis Instance**:
   - Go to Render → New → Redis
   - Note the connection details

3. **Create Web Service**:
   - Go to Render → New → Web Service
   - Connect your GitHub repo
   - Set build command: `npm run build`
   - Set start command: `npm run start:prod`
   - Add environment variables from `.env.example`

### Post-Deployment

After successful deployment:

```bash
# Test your deployed API
curl https://your-app-name.onrender.com/api/v1/papamalickteuw/users

# Check API documentation
open https://your-app-name.onrender.com/docs

# Verify database connection
curl -H "x-api-key: your-generated-api-key" \
  https://your-app-name.onrender.com/api/v1/papamalickteuw/transfers
```

### Troubleshooting

- **Build Failures**: Check Render logs for TypeScript errors
- **Database Connection**: Verify environment variables are set correctly
- **Health Check**: Ensure the health check endpoint returns 200
- **Cold Starts**: First requests may be slow due to serverless nature

### Costs

- **Free Tier**: 750 hours/month, suitable for development/testing
- **Paid Plans**: Start from $7/month for persistent services

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
