# Environment Variables Reference

This document lists all configurable environment variables for the SonarQube setup.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update at minimum:
   - `SONAR_TOKEN` - Your SonarQube authentication token
   - `SONAR_PROJECT_KEY` - Your project identifier
   - `SONAR_PROJECT_NAME` - Your project name

3. Optionally customize ports, passwords, and memory settings

## Environment Variables

### Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `sonarqube` | PostgreSQL database username |
| `POSTGRES_PASSWORD` | `sonarqube_password` | PostgreSQL database password |
| `POSTGRES_DB` | `sonarqube` | PostgreSQL database name |
| `POSTGRES_PORT_EXTERNAL` | `5433` | Port exposed on your machine |
| `POSTGRES_PORT_INTERNAL` | `5432` | Port inside container |
| `POSTGRES_VERSION` | `16-alpine` | PostgreSQL Docker image version |

### SonarQube Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SONARQUBE_VERSION` | `10.6.0-community` | SonarQube Docker image version |
| `SONARQUBE_PORT_EXTERNAL` | `9000` | Port to access SonarQube on your machine |
| `SONARQUBE_PORT_INTERNAL` | `9000` | Port inside container |
| `SONAR_HOST_URL` | `http://sonarqube-server:9000` | SonarQube server URL for scanner |

### Container Names

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_CONTAINER_NAME` | `sonarqube-db` | PostgreSQL container name |
| `SONARQUBE_CONTAINER_NAME` | `sonarqube-server` | SonarQube server container name |
| `SCANNER_CONTAINER_NAME` | `sonarqube-scanner` | Scanner container name |
| `SONARQUBE_NETWORK_NAME` | `sonarqube-network` | Docker network name |

### Memory Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_JAVA_XMX` | `2048m` | Maximum Java heap size |
| `SONAR_JAVA_XMS` | `512m` | Initial Java heap size |
| `SONAR_WEB_XMX` | `512m` | Web server max heap |
| `SONAR_CE_XMX` | `512m` | Compute engine max heap |
| `SONAR_SEARCH_XMS` | `512m` | Elasticsearch initial heap |
| `SONAR_SEARCH_XMX` | `512m` | Elasticsearch max heap |

**Memory Recommendations:**
- Minimum: 2GB total RAM (current defaults)
- Small projects: 4GB (set `SONAR_JAVA_XMX=4096m`)
- Large projects: 8GB+ (set `SONAR_JAVA_XMX=8192m`)

### Scanner Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_SCANNER_VERSION` | `latest` | Scanner Docker image version |
| `SONAR_TOKEN` | *required* | Authentication token from SonarQube UI |
| `SONAR_PROJECT_KEY` | *required* | Unique project identifier |
| `SONAR_PROJECT_NAME` | *required* | Human-readable project name |
| `SONAR_PROJECT_VERSION` | `1.0.0` | Project version |

### Source Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_SOURCES` | `apps,packages` | Directories to scan |
| `SONAR_EXCLUSIONS` | *see below* | Files/directories to exclude |

**Default Exclusions:**
```
**/node_modules/**
**/dist/**
**/build/**
**/.next/**
**/.expo/**
**/coverage/**
**/.git/**
**/.docker/**
**/.venv/**
**/venv/**
**/__pycache__/**
**/*.min.js
**/vendor/**
**/tmp/**
**/temp/**
**/.cache/**
```

### Language Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_JAVASCRIPT_FILE_SUFFIXES` | `.js,.jsx,.mjs,.cjs` | JavaScript file extensions |
| `SONAR_TYPESCRIPT_FILE_SUFFIXES` | `.ts,.tsx,.cts,.mts` | TypeScript file extensions |

### Coverage Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_JAVASCRIPT_LCOV_REPORTPATHS` | `coverage/lcov.info` | Path to coverage reports |
| `SONAR_COVERAGE_EXCLUSIONS` | `**/*.test.ts,...` | Files to exclude from coverage |

### Code Duplication

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_CPD_EXCLUSIONS` | `**/tests/**,...` | Files to exclude from duplication detection |

### General Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_SOURCEENCODING` | `UTF-8` | Source file encoding |
| `SONAR_VERBOSE` | `false` | Enable verbose scanner logging |

## Common Customizations

### Change Ports

If default ports conflict with other services:

```bash
# .env
POSTGRES_PORT_EXTERNAL=5434
SONARQUBE_PORT_EXTERNAL=9001
```

Then access SonarQube at: http://localhost:9001

### Increase Memory

For large projects:

```bash
# .env
SONAR_JAVA_XMX=4096m
SONAR_JAVA_XMS=1024m
SONAR_WEB_XMX=1024m
SONAR_CE_XMX=1024m
SONAR_SEARCH_XMX=1024m
```

### Change Database Credentials

```bash
# .env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=my_secure_password_123
POSTGRES_DB=mysonardb
```

### Scan Specific Directories

```bash
# .env

# Only scan API and mobile apps
SONAR_SOURCES=apps/api,apps/mobile

# Only scan web app
SONAR_SOURCES=apps/web

# Scan everything
SONAR_SOURCES=.
```

### Add Custom Exclusions

```bash
# .env
SONAR_EXCLUSIONS=**/node_modules/**,**/dist/**,custom-dir/**,**/generated/**
```

## Multiple Coverage Reports

If you have coverage reports from multiple packages:

```bash
# .env
SONAR_JAVASCRIPT_LCOV_REPORTPATHS=apps/api/coverage/lcov.info,apps/web/coverage/lcov.info,apps/mobile/coverage/lcov.info
```

## Running Multiple Instances

To run multiple SonarQube instances (e.g., for different projects):

```bash
# Instance 1: .env
POSTGRES_PORT_EXTERNAL=5433
SONARQUBE_PORT_EXTERNAL=9000
POSTGRES_CONTAINER_NAME=sonarqube-db-project1
SONARQUBE_CONTAINER_NAME=sonarqube-server-project1

# Instance 2: .env
POSTGRES_PORT_EXTERNAL=5434
SONARQUBE_PORT_EXTERNAL=9001
POSTGRES_CONTAINER_NAME=sonarqube-db-project2
SONARQUBE_CONTAINER_NAME=sonarqube-server-project2
```

## Portability

This setup is **100% portable** across macOS machines:

✅ No hardcoded usernames or paths
✅ All configuration in `.env` file
✅ Relative paths for volume mounts
✅ Environment variables with sensible defaults

To move to another machine:
1. Copy the entire `/packages/sonarqube` directory
2. Run `cp .env.example .env`
3. Update `SONAR_TOKEN` and project details
4. Run `./setup.sh`

## Security Notes

⚠️ **Never commit `.env` to git!**

The `.env` file contains:
- Database passwords
- SonarQube authentication tokens

Make sure `.env` is in your `.gitignore` file.

For production deployments:
- Use strong, unique passwords for `POSTGRES_PASSWORD`
- Rotate `SONAR_TOKEN` regularly
- Use specific version tags instead of `latest`
- Consider using secrets management (Vault, AWS Secrets Manager, etc.)

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :9000

# Change to different port in .env
SONARQUBE_PORT_EXTERNAL=9001
```

### Memory Issues

```bash
# Reduce memory if system has limited RAM
SONAR_JAVA_XMX=1024m
SONAR_WEB_XMX=256m
SONAR_CE_XMX=256m
SONAR_SEARCH_XMX=256m
```

### Container Name Conflicts

```bash
# Change container names in .env
POSTGRES_CONTAINER_NAME=my-sonarqube-db
SONARQUBE_CONTAINER_NAME=my-sonarqube-server
```

## Need Help?

- View current values: `cat .env`
- View all options: `cat .env.example`
- Reset to defaults: `cp .env.example .env`
