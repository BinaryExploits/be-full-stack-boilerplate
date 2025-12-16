# SonarQube Setup Guide

For local analysis of your project's code quality.

---

## Quick Setup

### 1. Copy and Create `.env`

Before any action, make sure you are in the `sonarqube` directory.

**For macOS/Linux:**

```bash
cd packages/sonarqube
cp .env.example .env
```

**For Windows:**

```batch
cd packages\sonarqube
copy .env.example .env
```

---

### 2. Start the SonarQube Server

**For macOS/Linux:**

Navigate to the unix scripts directory:

```bash
cd packages/sonarqube/unix
```

Make the start script executable (only once):

```bash
chmod +x start.sh
```

Then start the containers:

```bash
./start.sh
```

**For Windows:**

Navigate to the win scripts directory:

```batch
cd packages\sonarqube\win
```

Then start the containers:

```batch
start.bat
```

Wait until all containers finish starting.
Once complete, open your browser at:

**[http://localhost:9000](http://localhost:9000)**
(or the port defined in your `.env` file)

### Help:

If you get the following message then run stop script and try again.

```bash
Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:5433 -> 127.0.0.1:0: listen tcp 0.0.0.0:5433: bind: address already in use.
```

---

### 3. Login and Create Project

1. **Login credentials:**
   Username: `admin`
   Password: `admin`

2. **Change your password** (recommended).

3. **Create a new local project:**
   - Visit [http://localhost:9000/projects/create](http://localhost:9000/projects/create)
   - Click **Create a local project**
   - Enter a **project name**
   - Enter a **project key**
   - Set **main** as the main branch
   - At step 2, choose **instance's default**
   - Select **Analyze locally**
   - Generate a **non-expiring token**

4. Copy your **project key**, **project name**, and **token**, and paste them into your `.env` file.
   Also update the same values in `sonar-project.properties`.

---

### 4. Run the Code Scanner

**For macOS/Linux:**

Make the scanner script executable (only once):

```bash
chmod +x scan.sh
```

To scan run:

```bash
./scan.sh
```

**For Windows:**

To scan run:

```batch
scan.bat
```

When complete, open **[http://localhost:9000](http://localhost:9000)** to view your analysis results.

---

### 5. Stop the SonarQube Containers

To gracefully stop the running SonarQube and PostgreSQL containers:

**For macOS/Linux:**

Make the stop script executable (only once):

```bash
chmod +x stop.sh
```

To stop run:

```bash
./stop.sh
```

**For Windows:**

To stop run:

```batch
stop.bat
```

This will:

- Stop all SonarQube-related containers
- Ensure no background processes are left running

Use this when you simply want to **pause** your local SonarQube environment without deleting data.

---

### 6. Clean the Environment (Full Reset)

To completely remove all SonarQube containers, volumes, and networks:

**For macOS/Linux:**

Make the clean script executable (only once):

```bash
chmod +x clean.sh
```

To clean run:

```bash
./clean.sh
```

**For Windows:**

To clean run:

```batch
clean.bat
```

**Warning:**
This will permanently delete:

- The SonarQube database (analysis history, settings, and tokens)
- All Docker volumes and cached data

Use this only when you want a **fresh reset**.

---

## Project Structure

| File/Directory               | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `.env`                       | Personal environment configuration               |
| `.env.example`               | Template for creating `.env`                     |
| `docker-compose.yml`         | Defines SonarQube server and PostgreSQL database |
| `docker-compose-scanner.yml` | Defines the scanner container                    |
| `sonar-project.properties`   | Project analysis configuration                   |
| `README.md`                  | This setup guide                                 |
| **unix/**                    | **Scripts for macOS/Linux**                      |
| `unix/start.sh`              | Starts SonarQube server using Docker             |
| `unix/stop.sh`               | Gracefully stops SonarQube containers            |
| `unix/clean.sh`              | Removes all SonarQube containers and volumes     |
| `unix/scan.sh`               | Runs the SonarQube scanner for code analysis     |
| **win/**                     | **Scripts for Windows**                          |
| `win/start.bat`              | Starts SonarQube server using Docker             |
| `win/stop.bat`               | Gracefully stops SonarQube containers            |
| `win/clean.bat`              | Removes all SonarQube containers and volumes     |
| `win/scan.bat`               | Runs the SonarQube scanner for code analysis     |

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

**For macOS/Linux:**

1. Copy `.env.example` → `.env`
2. Navigate to unix scripts: `cd packages/sonarqube/unix`
3. Run `chmod +x start.sh && ./start.sh`
4. Login to SonarQube UI, create a project, and generate a token
5. Update `.env` and `sonar-project.properties`
6. Run `chmod +x scan.sh && ./scan.sh`
7. View results in the SonarQube dashboard
8. Stop with `./stop.sh` or fully reset with `./clean.sh`

**For Windows:**

1. Copy `.env.example` → `.env`
2. Navigate to win scripts: `cd packages\sonarqube\win`
3. Run `start.bat`
4. Login to SonarQube UI, create a project, and generate a token
5. Update `.env` and `sonar-project.properties`
6. Run `scan.bat`
7. View results in the SonarQube dashboard
8. Stop with `stop.bat` or fully reset with `clean.bat`

---

**Notes:**

- No manual Docker commands are required.
- Cross-platform compatible: Windows, macOS, and Linux.
- All configuration is environment-based for consistency and portability.
- Scripts are organized by platform in `unix/` and `win/` folders.
