# SentinelX Build System

.PHONY: all build test fmt lint docker-up docker-down clean help

# Default target
all: build

help:
	@echo "SentinelX Makefile Targets:"
	@echo "  build         - Compile both ingestion-service and log-agent binaries"
	@echo "  test          - Run unit tests for Go components"
	@echo "  fmt           - Format all Go codebase using gofmt"
	@echo "  lint          - Run lint checks (Go vet, ESLint for frontend)"
	@echo "  docker-up     - Start all services (Kafka, Postgres, UI, etc.) in Docker Compose"
	@echo "  docker-down   - Stop and remove all containers in Docker Compose"
	@echo "  clean         - Remove compiled binary artifacts"

build:
	@echo "==> Building Ingestion Service..."
	@cd ingestion-service && go build -o bin/ingestion-service cmd/server/main.go
	@echo "==> Building Log Agent..."
	@cd log-agent && go build -o bin/log-agent main.go

test:
	@echo "==> Running Ingestion Service tests..."
	@cd ingestion-service && go test ./... -v
	@echo "==> Running Log Agent tests..."
	@cd log-agent && go test ./... -v

fmt:
	@echo "==> Formatting Go files..."
	@cd ingestion-service && go fmt ./...
	@cd log-agent && go fmt ./...

lint:
	@echo "==> Vetting Go code..."
	@cd ingestion-service && go vet ./...
	@cd log-agent && go vet ./...
	@echo "==> Linting React frontend..."
	@cd frontend && npm run lint

docker-up:
	@echo "==> Spinning up SentinelX Docker stack..."
	docker compose up -d --build

docker-down:
	@echo "==> Tearing down SentinelX Docker stack..."
	docker compose down

clean:
	@echo "==> Cleaning up built binaries..."
	@rm -rf ingestion-service/bin/
	@rm -rf log-agent/bin/
