# Database Setup

This project uses different database configurations for local development and production:

- **Local Development**: PostgreSQL running in Docker
- **Production**: PlanetScale database accessed via Cloudflare Hyperdrive

## Local Development Setup

### Prerequisites
- Docker and Docker Compose installed
- Bun installed

### Steps

1. **Start the local PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

2. **Verify the database is running:**
   ```bash
   docker ps
   ```
   You should see `showly-postgres` container running.

3. **Set up your `.env` file:**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

4. **Run migrations:**
   The migrations will run automatically when you start the Alchemy development server:
   ```bash
   bun run dev
   ```

### Database Connection Details

The local PostgreSQL database uses these default credentials (configurable in `docker-compose.yml`):
- **Host**: localhost
- **Port**: 5432
- **Database**: showly
- **User**: postgres
- **Password**: postgres
- **Connection URL**: `postgresql://postgres:postgres@localhost:5432/showly`

### Managing the Database

**Stop the database:**
```bash
docker-compose down
```

**Stop and remove data:**
```bash
docker-compose down -v
```

**View logs:**
```bash
docker-compose logs -f postgres
```

**Access the database with psql:**
```bash
docker exec -it showly-postgres psql -U postgres -d showly
```

### Drizzle Studio

When running in local mode, Drizzle Studio will automatically start and connect to your local database. Access it at the URL shown in the console.

## Production Setup

In production, the application automatically uses:
- **PlanetScale** database for PostgreSQL
- **Cloudflare Hyperdrive** for connection pooling and caching

The production database is provisioned and configured automatically by Alchemy during deployment.

## How It Works

The `alchemy.run.ts` file detects the environment:

- **`app.local === true`**: Uses `LOCAL_DATABASE_URL` from `.env` (Docker Postgres)
- **`app.local === false`**: Provisions PlanetScale database and Hyperdrive binding

This ensures:
- Fast local development without cloud dependencies
- Seamless production deployment with managed database infrastructure
- No code changes needed between environments
