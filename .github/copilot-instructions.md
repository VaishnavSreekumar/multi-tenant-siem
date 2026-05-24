# Copilot Custom Instructions for SentinelX

These instructions define the coding standards, architectural patterns, and quality guidelines for the SentinelX repository. GitHub Copilot uses these rules during chat interactions, workspace generations, and automated pull request reviews.

---

## 1. Project Overview & Architecture
SentinelX is a high-throughput, multi-tenant Security Information and Event Management (SIEM) system.
* **Backend**: Written in Go 1.25.4. Decoupled using Apache Kafka for event transport and PostgreSQL for persistent audit trails.
* **Frontend**: React 19 dashboard built using Vite, TailwindCSS, and Recharts.
* **Agent**: Lightweight Go log collection agent (tails logs, runs regex parsers, and pushes to Kafka).

---

## 2. Go Coding Standards (`ingestion-service` & `log-agent`)
When reviewing, refactoring, or generating Go code, enforce the following guidelines:

### Concurrency & Batching
* **ACID Transactions**: Direct database inserts for security logs must always be batched (target: up to 500 logs or 2-second buffer timeout). Never perform raw, single-row inserts per log event.
* **Lock-free processing**: Prefer Go channels and worker pools over complex mutex locking mechanisms where possible.
* **Context Propagation**: Always pass `context.Context` as the first parameter of any network-bound, database-bound, or cancellable functions.

### Error Handling & Wrapping
* **No Ignored Errors**: All returned errors must be handled or logged.
* **Error Wrapping**: Wrap errors when passing them up the call stack to maintain debugging context:
  ```go
  return fmt.Errorf("retrieving alert history: %w", err)
  ```
* **Clean API Responses**: Do not expose raw internal database/system errors in API responses. Log the raw error internally and return clean, sanitized HTTP status codes/messages.

### Logging
* **Structured Logging**: Use structured logger packages (e.g., `log/slog`). Never use `fmt.Println` or standard standard library `log` for system operations.
* **Quiet Agents**: Ensure the edge `log-agent` suppresses terminal output by default during runtime to prevent unnecessary I/O overhead.

---

## 3. Database & Schema Design
* **Multi-Tenancy**: Every database table storing tenant data (logs, alerts, analytics) must include a `tenant_id` column. Ensure queries segment data by `tenant_id` at the data model level.
* **Indexes**: Verify that high-traffic queries on timestamps (`created_at`) and IPs (`source_ip`) utilize appropriate indexes.

---

## 4. Frontend Standards (`frontend`)
When reviewing or generating React components, enforce the following:

### Component Design
* **React 19 Hooks**: Use functional components with hook-based state management (e.g., `useState`, `useEffect`, `useMemo`).
* **Performance**: Throttle or batch real-time updates (e.g., incoming WebSocket alerts) to broadcast once per second rather than on every individual payload to reduce DOM rendering load.

### Styling & CSS
* **TailwindCSS**: Rely on Tailwind classes for responsiveness, layout, and theming. 
* **Harmonious Palettes**: Use professional, dark-mode-first color palettes suitable for a security dashboard (avoid raw, saturated primary red/green/blue).
* **No Inline Styles**: Restrict inline styling strictly to values that must be calculated dynamically at runtime (e.g., progress bar widths).

### Testing & Verification
* **Unique IDs**: Ensure all interactive DOM elements (buttons, forms, input fields, navigation links) have unique, descriptive `id` attributes to support automated end-to-end browser tests.

---

## 5. Security & Vulnerability Guidelines
* **Vulnerability Reporting**: All security vulnerabilities must be directed to `vaishnavsreekumar301@gmail.com`. Never log or commit plain text API keys or credentials.
* **Middleware**: Ensure endpoints utilize our rate-limiting middleware (100 requests/minute per IP) and strict CORS policies.

---

## 6. Git & Pull Request Guidelines
* **Conventional Commits**: Ensure commits match: `<type>(<scope>): <description>`.
* **DCO Sign-off**: Every commit must be signed off using the `-s` flag (`Signed-off-by: Your Name <your.email@example.com>`).
