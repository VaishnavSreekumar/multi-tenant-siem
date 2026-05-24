# Contributing to SentinelX

Thank you for your interest in contributing to SentinelX! As an enterprise-grade distributed SIEM platform, we rely on contributors like you to keep our ingestion pipelines fast, threat detection rules accurate, and dashboard intuitive.

Please read through these guidelines to understand how you can help, and to ensure a smooth, efficient contribution process.

---

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (detailed in [CODE_OF_CONDUCT.md](file:///c:/Users/vaish/siem/CODE_OF_CONDUCT.md) or standard community expectations: respect, collaboration, and professional conduct).

---

## How to Contribute

### 1. Reporting Bugs
* Search existing issues to verify the bug hasn't already been reported.
* Open a new issue with a descriptive title and a clear description.
* Include as much context as possible:
  * Operating System and version
  * Steps to reproduce the bug
  * Expected vs. actual behavior
  * Relevant logs, terminal output, or screenshots
  * Docker or configuration files used

### 2. Suggesting Enhancements
* Open an issue outlining the proposed feature or improvement.
* Describe the use case and why this enhancement is valuable to SentinelX users.
* Suggest implementation details or design considerations if you have them.

### 3. Submitting Pull Requests
* **Fork the Repository**: Create a fork of SentinelX and clone it locally.
* **Create a Feature Branch**: Use a descriptive name such as `feature/add-detection-rule` or `bugfix/fix-kafka-retry`.
* **Write Code**: Ensure your code meets our quality and styling standards.
* **Add Tests**: Write unit or integration tests for new functionality.
* **Commit Messages**: Follow our commit guidelines (see below).
* **Open a Pull Request**: Submit your PR targeting the `main` branch. Provide a detailed description of the changes.

---

## Development Setup

To test your changes locally, spin up the development stack using Docker Compose.

### Docker Stack Setup
Ensure you have Docker and Docker Compose installed with at least 4GB of RAM allocated.

```bash
# Start the message bus (Kafka), PostgreSQL, Prometheus, and Grafana
docker-compose up -d --build
```

For component-specific setup, refer to the guidelines below:

### Backend Development (`ingestion-service`)
The ingestion service is written in Go.
* Path: [ingestion-service/](file:///c:/Users/vaish/siem/ingestion-service)
* Run tests locally:
  ```bash
  cd ingestion-service
  go test ./...
  ```
* Ensure you format your code before committing:
  ```bash
  go fmt ./...
  ```

### Log Agent Development (`log-agent`)
The lightweight log agent tails and parses edge logs.
* Path: [log-agent/](file:///c:/Users/vaish/siem/log-agent)
* Run tests:
  ```bash
  cd log-agent
  go test ./...
  ```

### Frontend Development (`frontend`)
The SOC dashboard is built using React 19, Vite, and TailwindCSS.
* Path: [frontend/](file:///c:/Users/vaish/siem/frontend)
* Install dependencies and run the Vite dev server:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
* Lint and format checks:
  ```bash
  npm run lint
  ```

---

## Coding Standards & Style Guide

### Go Guidelines
* All Go code must be formatted using `gofmt`.
* Run static analysis using `golangci-lint` if available.
* Document exported packages, functions, and structs with clear comments.
* Handle all errors explicitly. Do not ignore errors.
* Use structured logging instead of standard `fmt.Println` for system operations.

### React & Frontend Guidelines
* Use React functional components with hooks.
* Maintain clean CSS / Tailwind configuration.
* Avoid inline styles unless absolutely dynamic.
* Ensure accessibility (a11y) standards are kept in mind.
* Ensure all interactive elements have unique and descriptive IDs for testing purposes.

### Git Commit Guidelines
We encourage **Conventional Commits** to keep our repository history clean and readable. Commit messages should be structured as follows:

`<type>(<scope>): <description>`

* **`feat`**: A new feature (e.g., `feat(detection): add brute force detection rule`)
* **`fix`**: A bug fix (e.g., `fix(kafka): resolve consumer lockup on rebalance`)
* **`docs`**: Documentation-only changes (e.g., `docs(readme): update deployment instructions`)
* **`style`**: Changes that do not affect the meaning of the code (formatting, white-space)
* **`refactor`**: A code change that neither fixes a bug nor adds a feature
* **`test`**: Adding missing tests or correcting existing tests
* **`chore`**: Maintenance tasks or build configuration changes

---

## Pull Request Guidelines

1. **Keep it focused**: PRs should address a single issue or implement one logical feature.
2. **Document your changes**: If your PR introduces new APIs or configuration parameters, update the appropriate documentation (e.g., `README.md` or API references).
3. **Verify builds**: Ensure the code builds locally and all tests pass.
4. **Code Review**: At least one maintainer must review and approve your PR before merging. Address review feedback constructively.

---

## Security Vulnerability Reporting

If you find a security vulnerability, **please do not open a public GitHub issue**. Instead, follow responsible disclosure guidelines by reporting it privately to the maintainers at `vaishnavsreekumar301@gmail.com` (or the repository security contact).

---

Thank you for helping make SentinelX a more secure and reliable platform!
