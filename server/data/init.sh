#!/bin/bash

# Wait for PostgreSQL to be ready
until PGPASSWORD=strapi psql -h jewelry-postgres -U strapi -d strapi -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing backup restore"

# Import the backup
PGPASSWORD=strapi psql -h jewelry-postgres -U strapi -d strapi < /docker-entrypoint-initdb.d/backup.sql