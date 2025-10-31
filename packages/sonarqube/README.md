# SonarQube Setup Guide

For local analysis of your project’s code quality.

---

## Quick Setup

### 1. Copy and Create `.env`

Before any action, make sure you are in the `sonarqube` directory.
If not, run this command from the root of the project:

```bash
cd packages/sonarqube
```

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

---

### 2. Start the SonarQube Server

Make the start script is executable (only once):

```bash
chmod +x start.sh
```

Then start the containers:

```bash
./start.sh
```

Wait until all containers finish starting.
Once complete, open your browser at:

**[http://localhost:9000](http://localhost:9000)**
(or the port defined in your `.env` file)

---

### 3. Login and Create Project

1. **Login credentials:**
   Username: `admin`
   Password: `admin`

2. **Change your password** (recommended).

3. **Create a new local project:**

    * Visit [http://localhost:9000/projects/create](http://localhost:9000/projects/create)
    * Click **Create a local project**
    * Enter a **project name**
    * Enter a **project key**
    * Set **main** as the main branch
    * At step 2, choose **instance's default**
    * Select **Analyze locally**
    * Generate a **non-expiring token**

4. Copy your **project key**, **project name**, and **token**, and paste them into your `.env` file.
   Also update the same values in `sonar-project.properties`.

---

### 4. Run the Code Scanner

Make the scanner script is executable (only once):

```bash
chmod +x scan.sh
```

To scan run:

```bash
./scan.sh
```

When complete, open **[http://localhost:9000](http://localhost:9000)** to view your analysis results.

---

### 5. Stop the SonarQube Containers

To gracefully stop the running SonarQube and PostgreSQL containers:

Make the stop script is executable (only once):

```bash
chmod +x stop.sh
```

To stop run:

```bash
./stop.sh
```

This will:

* Stop all SonarQube-related containers
* Ensure no background processes are left running

Use this when you simply want to **pause** your local SonarQube environment without deleting data.

---

### 6. Clean the Environment (Full Reset)

To completely remove all SonarQube containers, volumes, and networks:

Make the clean script is executable (only once):

```bash
chmod +x clean.sh
```
To clean run:

```bash
./clean.sh
```

**Warning:**
This will permanently delete:

* The SonarQube database (analysis history, settings, and tokens)
* All Docker volumes and cached data
  Use this only when you want a **fresh reset**.

---

## Project Structure

| File                         | Purpose                                          |
|------------------------------| ------------------------------------------------ |
| `.env`                       | Personal environment configuration               |
| `.env.example`               | Template for creating `.env`                     |
| `docker-compose.yml`         | Defines SonarQube server and PostgreSQL database |
| `docker-compose-scanner.yml` | Defines the scanner container                    |
| `start.sh`                   | Starts SonarQube server using Docker             |
| `stop.sh`                    | Gracefully stops SonarQube containers            |
| `clean.sh`                   | Removes all SonarQube containers and volumes     |
| `scan.sh`                    | Runs the SonarQube scanner for code analysis     |
| `sonar-project.properties`   | Project analysis configuration                   |
| `README.md`                  | This setup guide                                 |

> You do not need to edit any `.yml` files — all configuration is handled via `.env`.

---

## Environment Variables

| Variable                            | Description                                                                                         | Example / Default                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `POSTGRES_USER`                     | PostgreSQL username used by SonarQube                                                               | `sonar-user`                          |
| `POSTGRES_PASSWORD`                 | PostgreSQL password for the above user                                                              | `sonar-password`                      |
| `POSTGRES_DB`                       | Name of the SonarQube database                                                                      | `sonar-db`                            |
| `POSTGRES_PORT_HOST`                | Host port mapped to PostgreSQL container port (5432). Change if 5432 is in use.                     | `5433`                                |
| `SONARQUBE_PORT_HOST`               | Host port mapped to SonarQube web server (container 9000).                                          | `9000`                                |
| `POSTGRES_CONTAINER_NAME`           | Name of the PostgreSQL container.                                                                   | `sonarqube-db`                        |
| `SONAR_CONTAINER_NAME`              | Name of the SonarQube server container.                                                             | `sonarqube-server`                    |
| `SCANNER_CONTAINER_NAME`            | Name of the Sonar Scanner container.                                                                | `sonarqube-scanner`                   |
| `SONARQUBE_NETWORK_NAME`            | Docker network name connecting all SonarQube containers. Should match in both docker-compose files. | `sonarqube_sonarqube-net`             |
| `SONAR_HOST_URL`                    | URL of your SonarQube server, accessible by the scanner container.                                  | `http://sonarqube-server:9000`        |
| `SONAR_TOKEN`                       | Authentication token generated in SonarQube UI (non-expiring).                                      | `sqp_...`                             |
| `SONAR_PROJECT_KEY`                 | Unique project key (set when creating the project in SonarQube).                                    | `be-full-stack-boilerplate`           |
| `SONAR_PROJECT_NAME`                | Display name of the project in SonarQube.                                                           | `be-full-stack-boilerplate`           |
| `SONAR_PROJECT_VERSION`             | Version label for the analysis results.                                                             | `1.0.0`                               |
| `SONAR_SOURCES`                     | Source directories to analyze. Usually `.` for root.                                                | `.`                                   |
| `SONAR_EXCLUSIONS`                  | Paths and files to exclude from scanning.                                                           | `**/node_modules/**, **/dist/**, ...` |
| `SONAR_JAVASCRIPT_FILE_SUFFIXES`    | File extensions recognized as JavaScript.                                                           | `.js,.jsx,.mjs,.cjs`                  |
| `SONAR_TYPESCRIPT_FILE_SUFFIXES`    | File extensions recognized as TypeScript.                                                           | `.ts,.tsx,.cts,.mts`                  |
| `SONAR_JAVASCRIPT_LCOV_REPORTPATHS` | Path to coverage report (used for test coverage metrics).                                           | `coverage/lcov.info`                  |
| `SONAR_COVERAGE_EXCLUSIONS`         | Files excluded from coverage reports.                                                               | `**/*.test.ts, **/__tests__/**, ...`  |
| `SONAR_CPD_EXCLUSIONS`              | Files excluded from duplicate code analysis.                                                        | `**/tests/**, **/*.spec.ts, ...`      |
| `SONAR_SOURCE_ENCODING`             | Source file encoding format.                                                                        | `UTF-8`                               |
| `SONAR_WS_TIMEOUT`                  | Timeout (in seconds) for scanner communication with server.                                         | `300`                                 |
| `SONAR_VERBOSE`                     | Enable or disable verbose output for debugging.                                                     | `false`                               |

---

## Summary

1. Copy `.env.example` → `.env`
2. Run `chmod +x start.sh && ./start.sh`
3. Login to SonarQube UI, create a project, and generate a token
4. Update `.env` and `sonar-project.properties`
5. Run `chmod +x scan.sh && ./scan.sh`
6. View results in the SonarQube dashboard
7. Stop with `./stop.sh` or fully reset with `./clean.sh`

---

**Notes:**

* No manual Docker commands are required.
* Compatible with macOS and Linux.
* All configuration is environment-based for consistency and portability.