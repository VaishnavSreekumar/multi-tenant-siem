# Contributing to SentinelX

Thank you for your interest in contributing to SentinelX! This document provides guidelines, full setup instructions, and best practices for contributors to our enterprise-grade distributed SIEM platform.

---

## Table of Contents
* [Developer Certificate of Origin (DCO)](#developer-certificate-of-origin-dco)
* [Development Environment Setup](#development-environment-setup)
* [Building from Source](#building-from-source)
* [Running Tests](#running-tests)
* [Project Structure](#project-structure)
* [Development Workflow](#development-workflow)
* [Commit Message Convention](#commit-message-convention)
* [Code Style](#code-style)
* [Pull Request Guidelines](#pull-request-guidelines)
* [Reporting Issues](#reporting-issues)
* [Security Vulnerabilities](#security-vulnerabilities)
* [License](#license)

---

## Developer Certificate of Origin (DCO)

All contributions to SentinelX must be signed off under the Developer Certificate of Origin (DCO). This certifies that you wrote or have the right to submit the code you are contributing.

Every commit must include a `Signed-off-by` line:

```text
Signed-off-by: Your Name <your.email@example.com>
```

You can do this automatically by committing with the `-s` flag:

```bash
git commit -s -m "feat(detection): add brute force detection rule"
```

---

## Development Environment Setup

### System Requirements
| Requirement | Minimum | Recommended | Notes |
|---|---|---|---|
| OS | Linux / macOS | Linux / macOS / WSL2 | Windows is supported via Git Bash or WSL2 |
| Go | 1.21 | 1.25.4+ | Install from [go.dev](https://go.dev/dl/) |
| Node.js | 18.0.0 | 20.0.0+ | Required for Vite & React frontend |
| Docker | 20.10 | Latest | For Kafka, Postgres, and Grafana stacks |
| Docker Compose | v2.0 | Latest | For multi-container orchestration |
| Git | 2.30 | Latest | Source control management |

### Step 1 - Install System Dependencies
#### Ubuntu / Debian:
```bash
sudo apt-get update
sudo apt-get install -y \
  make gcc pkg-config \
  git curl docker.io docker-compose-v2
```

#### Fedora:
```bash
sudo dnf install -y \
  make gcc pkg-config \
  git curl docker docker-compose
```

#### macOS:
```bash
brew install make git curl docker docker-compose
```

### Step 2 - Install Go
If you don't have Go 1.25.4+ installed:

```bash
# Download (adjust version/arch as needed)
curl -fsSL https://go.dev/dl/go1.25.4.linux-amd64.tar.gz -o /tmp/go.tar.gz

# Install
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf /tmp/go.tar.gz

# Add to PATH (add to ~/.bashrc or ~/.zshrc for persistence)
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

# Verify
go version
```

### Step 3 - Install Node.js & npm
Ensure Node.js 18+ is installed to run the frontend build system:

```bash
# Using NodeSource Node.js LTS installer (Ubuntu example)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node and npm
node -v
npm -v
```

### Step 4 - Verify Docker Setup
SentinelX relies on Docker to orchestrate dependencies like Kafka and PostgreSQL. Verify that your Docker daemon is active:

```bash
docker info
```

### Step 5 - Clone and Build
```bash
# Clone the repository
git clone https://github.com/VaishnavSreekumar/multi-tenant-siem.git
cd multi-tenant-siem

# Build both Go service binaries (ingestion-service & log-agent)
make build

# Verify binaries work
./ingestion-service/bin/ingestion-service --help
./log-agent/bin/log-agent --help
```

### Step 6 - Run Docker Services Stack
To start the backing infrastructure (PostgreSQL, Kafka, Prometheus, and Grafana):

```bash
# Start all dependencies in the background
make docker-up
```

---

## Building from Source

### Make Targets
We utilize a root-level [Makefile](file:///c:/Users/vaish/siem/Makefile) to orchestrate building, formatting, and running services:

| Target | Description | Requires Root |
|---|---|---|
| `make build` | Compile Go binaries for `ingestion-service` and `log-agent` | No |
| `make test` | Run unit tests across Go projects | No |
| `make fmt` | Format all Go codebase using `gofmt` | No |
| `make lint` | Run Go vet and ESLint linting for React frontend | No |
| `make docker-up` | Build and start Docker stack in the background | No |
| `make docker-down` | Stop and remove the Docker containers | No |
| `make clean` | Remove compiled Go binaries from output directories | No |
| `make help` | Show all targets with descriptions | No |

---

## Running Tests

SentinelX prioritizes comprehensive test coverage. Run tests locally using the following commands:

```bash
# Run unit tests across all Go components
make test

# Run Go tests for a specific package with verbosity
cd ingestion-service
go test ./internal/detection/... -v

# Run lint and validation suite (CI equivalent)
make lint
```

### Test Categories
* **Ingestion Service**: Evaluates API authentication logic, rate-limiters, threat detection rules (brute-force, path scanning), suppressor states, and database batch transaction updates.
* **Log Agent**: Verifies regex parsers for SSH/auth logs and Nginx access logs, and transmission queue safety.
* **Frontend**: Inspects React components, custom layouts, routing, and real-time WebSocket connection handling.

---

## Project Structure

A high-level map of the SentinelX directory layout:

```text
.
├── docker-compose.yml         # Container Orchestration
├── prometheus.yml             # Prometheus Configuration
├── README.md                  # Documentation
├── Makefile                   # Build orchestration
├── schema.sql                 # Database Migrations
├── ingestion-service/         # Core Processing Engine (Go)
│   ├── Dockerfile             # Container Image Definition
│   ├── go.mod                 # Go Module Dependencies
│   ├── cmd/
│   │   └── server/            # Application Entry Point
│   └── internal/
│       ├── auth/              # API Key Authentication
│       ├── db/                # PostgreSQL Connection Management
│       ├── detection/         # Threat Detection Rules & Suppression
│       ├── events/            # Event Schema Definitions
│       ├── handler/           # HTTP Request Handlers
│       ├── kafka/             # Kafka Consumer
│       ├── metrics/           # Prometheus Instrumentation
│       ├── middleware/        # HTTP Middleware
│       ├── model/             # Data Models
│       ├── queue/             # Event Buffering
│       ├── repository/        # Data Access Layer
│       ├── service/           # Ingestion and Worker Business Logic
│       ├── validator/         # Input Validation
│       └── websocket/         # Real-time Event Hub (WebSockets)
├── log-agent/                 # Edge Log Collection Agent (Go)
│   ├── go.mod                 # Go Module Dependencies
│   ├── main.go                # Application Entry Point
│   ├── events/                # Event Schema
│   ├── kafka/                 # Kafka Producer
│   ├── parser/                # Log Parsers (Auth, Nginx)
│   └── sender/                # Log Transmission Logic
├── frontend/                  # Web SOC Dashboard (React 19, Vite, TailwindCSS)
│   ├── package.json           # Dependencies & Scripts
│   ├── vite.config.js         # Vite configuration
│   └── src/                   # React Source Code
└── grafana/                   # Grafana provisioning configurations
```

---

## Development Workflow

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/multi-tenant-siem.git
   cd multi-tenant-siem
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/VaishnavSreekumar/multi-tenant-siem.git
   ```
4. **Create a feature branch** from main:
   ```bash
   git fetch upstream
   git checkout -b feat/my-feature upstream/main
   ```
5. **Make your changes** following our coding guidelines.
6. **Verify your work**:
   ```bash
   make fmt
   make lint
   make test
   ```
7. **Commit with DCO sign-off**:
   ```bash
   git commit -s -m "feat(detection): description of change"
   ```
8. **Push your branch** and open a **Pull Request**:
   ```bash
   git push origin feat/my-feature
   ```

---

## Commit Message Convention

We strictly follow **Conventional Commits**:

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
Signed-off-by: Your Name <your.email@example.com>
```

### Commit Types
* **`feat`**: A new feature (e.g., `feat(detection): add brute force detection rule`)
* **`fix`**: A bug fix (e.g., `fix(kafka): resolve consumer lockup on rebalance`)
* **`docs`**: Documentation-only changes (e.g., `docs(readme): update deployment instructions`)
* **`style`**: Changes that do not affect the meaning of the code (formatting, white-space)
* **`refactor`**: A code change that neither fixes a bug nor adds a feature
* **`test`**: Adding missing tests or correcting existing tests
* **`chore`**: Maintenance tasks or build configuration changes

### Scopes
Use scopes like `ingestion`, `agent`, `frontend`, `db`, `detection`, `metrics`, `config`, or `docker`.

---

## Code Style

### Go Guidelines
* Standard format: Code must pass `gofmt` and standard check tools.
* Document exported types, functions, and structs with clean comments.
* Structured Logging: Use structured log output for system metrics and events.
* Error Handling: Handle errors explicitly. Wrap error context using `fmt.Errorf("context: %w", err)`.
* Run `make fmt` before submitting your pull request.

### React / Frontend Guidelines
* React 19: Use React functional components and clean hook-based state management.
* Styling: Use utility classes from TailwindCSS; keep CSS variables clean inside [index.css](file:///c:/Users/vaish/siem/frontend/src/index.css).
* Unique Identifiers: Ensure all interactive frontend elements (inputs, buttons) have unique, descriptive IDs for end-to-end and browser testing.

---

## Pull Request Guidelines

1. **Keep it focused**: PRs should address a single issue or implement one feature.
2. **Verify builds**: Ensure the code builds locally and all tests pass.
3. **CI Status**: Ensure all validation checks on GitHub Actions pass.
4. **Code Review**: At least one maintainer must review and approve your PR before merging. Address review feedback constructively.

### PR Slash Commands
SentinelX PR review queue utilizes automated bots for command workflows.

| Command | Allowed Users | Effect |
|---|---|---|
| `/help` | Anyone | List available commands |
| `/retest` | Anyone | Re-run any failed CI checks on the current commit |
| `/close` | Author / Maintainer | Close the PR |
| `/approve` | Maintainer | Record approval and mark ready for merge |
| `/merge` | Maintainer | Squash-merge the PR if status checks are green |

---

## Reporting Issues

* Use structured templates for bugs and feature requests.
* Provide clear steps to reproduce, sample logs, and environment configurations.
* Include platform specifications (Go version, OS version, Node version, Docker version).

---

## Security Vulnerabilities

If you identify a security vulnerability in SentinelX, **do not file a public GitHub issue**. Instead, follow responsible disclosure practices and email the security contact directly at:
**[vaishnavsreekumar301@gmail.com](mailto:vaishnavsreekumar301@gmail.com)**

---

## License

By contributing to SentinelX, you agree that your contributions will be licensed under the **Apache License 2.0**.
