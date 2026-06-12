---
name: devops-cloud
description: Orchestrate multi-stage Docker builds, docker-compose networks, cloud infrastructure provisioning with Terraform IaC, CI/CD pipeline automation, and zero-downtime rollout configurations.
---

# DevOps & Cloud Infrastructure Skill

This skill teaches the coding agent how to build robust deployment environments, write clean Dockerfiles, orchestrate container networks, provision cloud assets using Terraform, and automate CI/CD release cycles.

---

## 1. Multi-Stage Docker Builds

Dockerfiles must be optimized for size, security, and cache layering. Never package build tools, compilers, or source repositories inside final production images.

### Dockerfile Design Rules
1. **Multi-Stage Separation**: Perform code compilation and dependency downloads in a transient `builder` container. Copy only the compiled/built artifacts to a lightweight runtime base image.
2. **Use Minimal Base Images**: Choose `alpine` or `slim` versions (e.g., `node:20-alpine`, `python:3.12-slim`) to minimize the image attack surface.
3. **Non-Root Execution**: Always configure and switch to a non-root system user (e.g., `USER node` in Node or creating a custom user/group in Alpine) before starting the application.
4. **Port Configuration**: Expose standard ports (`EXPOSE 3000` for frontend, `EXPOSE 8000` for backend).

### Example Node.js Dockerfile
```dockerfile
# Stage 1: Build dependencies and compile code
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

# Stage 2: Final runtime container
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Run as non-root user
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Example Python (FastAPI / Django) Dockerfile
```dockerfile
# Stage 1: Build dependencies
FROM python:3.12-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final runtime container
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/root/.local/bin:$PATH
# Create a non-privileged user to run the app
RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -d /app -s /sbin/nologin -c "Docker image user" appuser
# Copy installed python dependencies from builder stage
COPY --from=builder /root/.local /root/.local
COPY . .
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 2. Docker Compose Orchestration

For multi-container setups, write clean networks, volume mounts, and startup dependencies to prevent race conditions during environment initialization.

### Compose Rules
1. **Healthchecks**: Include standard healthchecks for backend databases.
2. **Dependencies Execution**: Link downstream services (like the backend API) to the database using `depends_on` with `condition: service_healthy` rules.
3. **No Localhost Bindings Inter-container**: Use service names defined in `docker-compose.yml` (e.g., `http://backend:8000`) for network communication between containers.

### Example configuration
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/appdb
      PORT: 8000
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

---

## 3. Terraform (Infrastructure-as-Code)

Organize Terraform code following a modular architecture. Avoid giant, single-file configurations.

### Directory structure
```text
terraform/
├── providers.tf      # Provider and version limits
├── backend.tf        # Remote state storage config
├── variables.tf      # Parameter variables
├── outputs.tf        # Resource IDs and endpoints output
├── main.tf           # Resource coordination
└── modules/          # Encapsulated component folders (vpc, db, compute)
```

### State Storage Rule
* **Always use remote state backends** (S3/DynamoDB, Azure Blob, GCS) with state locking enabled. Never store local `.tfstate` files in version control.

---

## 4. CI/CD Pipeline Automation

Workflows must validate code state on pull requests and automate builds and deployments when merging to main branches.

### GitHub Actions Blueprint
* **Step 1: Test & Quality Checks (PR Trigger)**:
  * Run code quality lint checks (ESLint, Prettier).
  * Run testing suite (Vitest, Jest, Pytest) and verify test coverage.
* **Step 2: Build & Publish (Merge Trigger)**:
  * Build production Docker images.
  * Tag images with GitHub SHA and push them to container registries (DockerHub, AWS ECR, Azure ACR).
* **Step 3: Rollout / Deploy**:
  * Execute database migrations (`prisma migrate deploy` or alembic upgrade).
  * Deploy using a **rolling update** strategy (minimum health capacity parameters kept at `100%` while scaling new instances to prevent connection drops).
