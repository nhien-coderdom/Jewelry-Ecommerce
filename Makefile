.PHONY: help build up down restart logs clean install test backup restore

help: ## Show this help message
	@echo "Jewelry E-commerce - Docker Commands"
	@echo "====================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build all containers
	docker-compose build

up: ## Start all containers
	docker-compose up -d

up-build: ## Build and start all containers
	docker-compose up -d --build

down: ## Stop all containers
	docker-compose down

restart: ## Restart all containers
	docker-compose restart

logs: ## View logs of all containers
	docker-compose logs -f

logs-client: ## View client logs
	docker-compose logs -f client

logs-server: ## View server logs
	docker-compose logs -f server

logs-db: ## View database logs
	docker-compose logs -f postgres

ps: ## Show running containers
	docker-compose ps

clean: ## Stop containers and remove volumes (WARNING: deletes database!)
	@echo "This will delete all data including database. Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]
	docker-compose down -v
	docker system prune -f

clean-all: ## Clean everything including images
	@echo "This will delete everything. Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]
	docker-compose down -v
	docker system prune -af

install: ## Install dependencies in containers
	docker-compose exec client npm install
	docker-compose exec server npm install

install-client: ## Install client dependencies
	docker-compose exec client npm install

install-server: ## Install server dependencies
	docker-compose exec server npm install

shell-client: ## Access client shell
	docker-compose exec client sh

shell-server: ## Access server shell
	docker-compose exec server sh

shell-db: ## Access database shell
	docker-compose exec postgres psql -U strapi -d jewelry_db

backup: ## Backup database
	docker-compose exec postgres pg_dump -U strapi jewelry_db > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Database backed up successfully"

restore: ## Restore database from backup (Usage: make restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "Please specify FILE=backup.sql"; exit 1; fi
	cat $(FILE) | docker-compose exec -T postgres psql -U strapi jewelry_db
	@echo "Database restored successfully"

test: ## Run tests
	docker-compose exec client npm test
	docker-compose exec server npm test

dev: ## Start in development mode with logs
	docker-compose up

prod: ## Start in production mode
	docker-compose -f docker-compose.prod.yml up -d --build

prod-down: ## Stop production containers
	docker-compose -f docker-compose.prod.yml down

stats: ## Show container resource usage
	docker stats

prune: ## Remove unused Docker resources
	docker system prune -f
