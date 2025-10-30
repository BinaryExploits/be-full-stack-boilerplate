# 🧠 SonarQube Setup Guide 

For local analysis of your project’s code quality.

---

## 🚀 Quick Setup

### 1. Copy and Create `.env`

Before any action, make sure you are in the sonarqube directory (if not, run this command from the root of the project):
```bash
cd packages/sonarqube
```

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

### 2. Start the SonarQube Server

Make the setup script executable (only once):

```bash
chmod +x setup.sh
```

Then run it:

```bash
./setup.sh
```

Wait until all containers finish starting.
Once complete, open your browser at:

👉 **[http://localhost:9000](http://localhost:9000)** (or the port defined in your `.env`)

---

### 3. Login and Create Project

1. **Login:**
   **Username:** `admin`
   **Password:** `admin`

2. **Change your password** (recommended).

3. **Create a new local project**:

    * At http://localhost:9000/projects/create Click **Create a local project**
    * Enter a **project name**
    * Enter a **project key**
    * Set **main** as **main branch**
    * At step 2, choose **instance's default** option
    * Choose to analyze **locally**
    * Generate a **non-expiring token**

4. Copy your **project key**, **project name**, and **token**

    * Paste them into your `.env`
    * Also update the same values in `sonar-project.properties`

---

### 4. Run the Code Scanner

Make the scanner script executable (only once):

```bash
chmod +x scan.sh
```

Then run:

```bash
./scan.sh
```

Wait for it to finish.
Once done, open **[http://localhost:9000](http://localhost:9000)** and see your results 🎯

---

## 📁 Project Structure

| File                         | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| `.env`                       | Your personal environment configuration           |
| `.env.example`               | Template for creating `.env`                      |
| `docker-compose.yml`         | Defines SonarQube server + PostgreSQL database    |
| `docker-compose-scanner.yml` | Defines the scanner container                     |
| `setup.sh`                   | Starts the SonarQube server using Docker          |
| `scan.sh`                    | Runs the SonarQube scanner for code analysis      |
| `sonar-project.properties`   | Project analysis configuration (key, name, paths) |
| `README.md`                  | This setup guide                                  |

👉 You **don’t need to edit any `.yml` files** — just use the `.env` file.

---

## ⚙️ Environment Variables

| **Variable** | **Description** | **Example / Default** |
|---------------|------------------|------------------------|
| `POSTGRES_USER` | PostgreSQL username used by SonarQube | `sonar-user` |
| `POSTGRES_PASSWORD` | PostgreSQL password for the above user | `sonar-password` |
| `POSTGRES_DB` | Name of the SonarQube database | `sonar-db` |
| `POSTGRES_PORT_HOST` | Host port mapped to PostgreSQL container port (5432). Change if 5432 is in use. | `5433` |
| `SONARQUBE_PORT_HOST` | Host port mapped to SonarQube web server (container 9000). | `9000` |
| `POSTGRES_CONTAINER_NAME` | Name of the PostgreSQL container. | `sonarqube-db` |
| `SONAR_CONTAINER_NAME` | Name of the SonarQube server container. | `sonarqube-server` |
| `SCANNER_CONTAINER_NAME` | Name of the Sonar Scanner container. | `sonarqube-scanner` |
| `SONARQUBE_NETWORK_NAME` | Docker network name connecting all SonarQube containers. Should match in both docker-compose files. | `sonarqube_sonarqube-net` |
| `SONAR_HOST_URL` | URL of your SonarQube server, accessible by the scanner container. | `http://sonarqube-server:9000` |
| `SONAR_TOKEN` | Authentication token generated in SonarQube UI (non-expiring). | `sqp_...` |
| `SONAR_PROJECT_KEY` | Unique project key (set when creating the project in SonarQube). | `be-full-stack-boilerplate` |
| `SONAR_PROJECT_NAME` | Display name of the project in SonarQube. | `be-full-stack-boilerplate` |
| `SONAR_PROJECT_VERSION` | Version label for the analysis results. | `1.0.0` |
| `SONAR_SOURCES` | Source directories to analyze. Usually `.` for root. | `.` |
| `SONAR_EXCLUSIONS` | Paths and files to exclude from scanning. | `**/node_modules/**, **/dist/**, ...` |
| `SONAR_JAVASCRIPT_FILE_SUFFIXES` | File extensions recognized as JavaScript. | `.js,.jsx,.mjs,.cjs` |
| `SONAR_TYPESCRIPT_FILE_SUFFIXES` | File extensions recognized as TypeScript. | `.ts,.tsx,.cts,.mts` |
| `SONAR_JAVASCRIPT_LCOV_REPORTPATHS` | Path to coverage report (used for test coverage metrics). | `coverage/lcov.info` |
| `SONAR_COVERAGE_EXCLUSIONS` | Files excluded from coverage reports. | `**/*.test.ts, **/__tests__/**, ...` |
| `SONAR_CPD_EXCLUSIONS` | Files excluded from copy-paste detection (duplicate code analysis). | `**/tests/**, **/*.spec.ts, ...` |
| `SONAR_SOURCE_ENCODING` | Source file encoding format. | `UTF-8` |
| `SONAR_WS_TIMEOUT` | Timeout (in seconds) for scanner communication with server. | `300` |
| `SONAR_VERBOSE` | Enable or disable verbose output for debugging. | `false` |

---

## 🧩 Summary

1. Copy `.env.example` → `.env`
2. Run `chmod +x setup.sh && ./setup.sh`
3. Login to SonarQube UI, create project, and generate token
4. Update `.env` and `sonar-project.properties`
5. Run `chmod +x scan.sh && ./scan.sh`
6. 🎉 View results in SonarQube dashboard

---

✅ No manual Docker commands needed
✅ Works on macOS and Linux
✅ All configuration lives in `.env`
