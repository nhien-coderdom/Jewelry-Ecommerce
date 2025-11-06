# Database Setup Instructions

When setting up the project for the first time, the database will be automatically initialized with the backup data. This happens because:

1. The backup.sql file is mounted into the postgres container at /docker-entrypoint-initdb.d/
2. PostgreSQL automatically executes any .sql files in this directory when initializing a new database

## If you need to manually restore the database:

```bash
# Stop all containers
docker compose down

# Remove existing volumes
docker compose down -v

# Start containers again
docker compose up -d
```

This will automatically restore the database from the backup file.

## If you need to create a new backup:

```bash
# Create a new backup
docker exec -i jewelry-postgres pg_dump -U strapi strapi > server/data/backup.sql
```