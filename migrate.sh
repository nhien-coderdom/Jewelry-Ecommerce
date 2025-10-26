#!/bin/bash

# SQLite to PostgreSQL Migration Script
echo "Starting SQLite to PostgreSQL migration..."

# Install sqlite3 if not available
which sqlite3 || apk add --no-cache sqlite

# Check if SQLite file exists
if [ ! -f "/app/data.db" ]; then
    echo "Error: SQLite database file not found at /app/data.db"
    exit 1
fi

# Create SQL dump from SQLite
echo "Creating SQL dump from SQLite..."
sqlite3 /app/data.db .dump > /app/sqlite_dump.sql

echo "SQLite dump created successfully!"

# Show tables in SQLite
echo "Tables in SQLite database:"
sqlite3 /app/data.db ".tables"

# PostgreSQL connection details from environment
PG_HOST=${DATABASE_HOST:-postgres}
PG_PORT=${DATABASE_PORT:-5432}
PG_DB=${DATABASE_NAME:-jewelry_db}
PG_USER=${DATABASE_USERNAME:-strapi}
PG_PASS=${DATABASE_PASSWORD:-strapi_password}

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h $PG_HOST -p $PG_PORT -U $PG_USER; do
    echo "PostgreSQL is not ready yet..."
    sleep 2
done

echo "PostgreSQL is ready!"

# Show current tables in PostgreSQL
echo "Current tables in PostgreSQL:"
PGPASSWORD=$PG_PASS psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DB -c "\dt"

echo "Migration script completed. Check the sqlite_dump.sql file for manual import if needed."