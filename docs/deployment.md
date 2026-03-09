# AWS EC2 deployment guide

This guide describes how to deploy a BE Full Stack app (or a derived app like CuliQuiz) on Amazon Linux EC2 using the minimal bootstrap script and in-repo deploy scripts.

**Option A — Terraform:** Use the [terraform/](../terraform/README.md) setup to provision the EC2 instance (security group, Elastic IP, Route 53 A record); the instance auto-bootstraps via `go.sh`. No key pair; connect via SSM Session Manager. **Option B — Manual:** Create the EC2 instance yourself (no key pair; use Session Manager to connect), copy `bootstrap/go.sh` to the instance, then run it as below.

## Prerequisites

- AWS account with EC2 and Route 53 (zone for binaryexperiments.com is set in go.sh)
- EC2 instance (Amazon Linux 2 or 2023)
- Git repo URL and **GitHub Personal Access Token** (for private HTTPS) or SSH key
- **No SSH key pair required** for the instance — connect via **AWS Systems Manager Session Manager** only. Do not enable SSH (port 22) in the security group unless you need it for debugging.
- For Terraform or AWS CLI from your machine: authenticate with SSO, e.g. `aws sso login --profile=your-profile` (e.g. `aws sso login --profile=be-wordpress`), then use that profile for `terraform` or `aws ssm start-session`.

The deploy scripts will **allocate and associate an Elastic IP** to the instance if it does not already have one (so the Route 53 A record stays stable).

## Recommended EC2 setup (tested)

- **AMI:** Amazon Linux 2023 kernel-6.1
- **Instance type:** t4g.medium (Graviton/ARM)
- **Storage:** 20 GB gp3
- **IAM role:** Assign the **instanceRole** IAM role to the instance; see [IAM role](#iam-role) below.
- **Security group:**
  - Allow **HTTP** (inbound 80) — **required** for Caddy/Let’s Encrypt ACME (certificate issuance and renewal).
  - Allow **HTTPS** (inbound 443)
  - Do **not** allow SSH (22) — use **Session Manager** only to connect and copy `go.sh`. No key pair is needed.

## Minimal steps

### 1. Launch EC2

- Launch an instance using the recommended setup above (or equivalent). You do **not** need to attach an Elastic IP beforehand; the deploy will allocate one and associate it with the instance if missing.
- Ensure the security group allows inbound **80** (HTTP) and **443** (HTTPS). Use Session Manager to connect (no SSH required).

### 2. Copy only `go.sh` to the instance

Connect via **Session Manager** (AWS Systems Manager). Create `go.sh` in your **home folder** (`~`). By default Session Manager may not start in your home directory, so run `cd ~` first, then create `~/go.sh` and paste the contents of `bootstrap/go.sh` (or upload the file via S3 or an SSM document). Make the script executable with **`chmod +x ~/go.sh`** (required before running it):

```bash
cd ~
# create ~/go.sh here (paste contents or upload), then:
chmod +x ~/go.sh
```

### 3. Run the first deploy

Edit the **EDIT ONCE** block at the top of `~/go.sh` and set `REPO_URL`, `GITHUB_TOKEN`, and `BRANCH`. Then from your home folder (`cd ~` if needed), run:

```bash
./go.sh full
```

(You can still override with env: `REPO_URL="..." GITHUB_TOKEN="..." ./go.sh full`.)

First run will:

1. Install git if missing
2. Clone the repo (main branch by default)
3. Run `scripts/ec2/run.sh`, which:
   - Pulls the repo (no-op after fresh clone)
   - Installs docker (and docker compose plugin) if missing
   - Ensures the instance has an Elastic IP (allocates and associates one if not already attached)
   - Updates Route 53 A record for `<repo-name>.binaryexperiments.com` to the instance’s public IP
   - Builds and runs the stack (migrate, seed, then up)

### 4. Production env files

If `~/.env.api.production` and `~/.env.web.production` are missing, the deploy copies them from **`bootstrap/env.api.production.sample`** and **`bootstrap/env.web.production.sample`** on first run. Edit the copied files with real values (Google, Rollbar, email keys). The deploy scripts use these paths by default.

**Rebrand before deploy (recommended):** From the repo root, run **`scripts/ec2/rebrand-env.sh`** to set the app domain, DB name, and generate new passwords in the sample files. Use **APP_DOMAIN** or **REPO_URL** (domain is derived from repo name):

```bash
APP_DOMAIN=myapp.binaryexperiments.com ./scripts/ec2/rebrand-env.sh
# or: REPO_URL=https://github.com/org/myapp.git ./scripts/ec2/rebrand-env.sh
```

The script overwrites the bootstrap samples with your domain, a generated DB name (e.g. `myappdb`), and new random passwords for Postgres, Mongo, and Better Auth. Third-party keys (Google, Rollbar, Resend/SES) stay as placeholders; fill those in the copied files on EC2. Set **APP_DOMAIN** in the API env to match the Route 53 record so Caddy serves the correct host and can obtain TLS.

### 5. Subsequent deploys

Same command; no need to copy or export anything again:

```bash
./go.sh full
```

`go.sh` will see the repo already exists, so it only runs `scripts/ec2/run.sh`, which pulls the latest and redeploys.

## Testing a branch

Set `BRANCH` in the **EDIT ONCE** block at the top of `~/go.sh` (e.g. `BRANCH=feature/my-feature`), or override when running: `BRANCH=feature/my-feature ./go.sh full`. Clone and pull both use `BRANCH`. When ready for production, set `BRANCH=main` in the script (or use the default) and redeploy.

## IAM role

A role named **instanceRole** exists with the required permissions (Session Manager, Route 53, EC2 for Elastic IP, and any others you’ve added such as SES). **Do not change instanceRole.** Assign it to the EC2 instance.

The instance role must allow: **ec2:AllocateAddress**, **ec2:AssociateAddress**, **ec2:DescribeAddresses**, **ec2:DescribeInstances** (for Elastic IP), plus Route 53 and Session Manager.

## Route 53 and Elastic IP

On each deploy the scripts:

1. Run **`scripts/ec2/elastic-ip.sh`**: if the instance has no Elastic IP, allocate one in the instance’s VPC and associate it. This gives the instance a stable public IP.
2. Run **`scripts/ec2/route53-update.sh`**: UPSERT the A record for **`<repo-name>.binaryexperiments.com`** to the instance’s current public IP (from metadata or EC2 describe-instances).

- **Hosted zone**: Zone ID for binaryexperiments.com is set in `bootstrap/go.sh` (not configurable via env). The **instanceRole** has the required Route 53 (and EC2) permissions.

## Troubleshooting

- **Git missing**: `go.sh` installs it automatically on first run. Ensure `sudo` is available.
- **Docker missing**: `run.sh` runs `scripts/ec2/install-deps.sh` to install docker on AL2/AL2023. If it fails, install docker manually and re-run.
- **Clone fails**: Check `GITHUB_TOKEN` (scope `repo` for private repos) or use an SSH `REPO_URL` and ensure the EC2 key has access.
- **Route 53 / no Elastic IP**: Route 53 is updated only when the instance has an Elastic IP (existing or allocated by `elastic-ip.sh`). EIP is required; there is no bypass. If the deploy fails with "Elastic IP required" or "refusing to point Route 53 at ephemeral IP", then (1) ensure the instance role has EC2 EIP permissions (`ec2:AllocateAddress`, `ec2:AssociateAddress`, `ec2:DescribeAddresses`, `ec2:DescribeInstances`), (2) ensure instance metadata is reachable (IMDSv2). **Manual fallback:** In the AWS console, allocate an Elastic IP, associate it with this instance, then re-run the deploy (elastic-ip.sh will detect the existing EIP and continue).
- **App not reachable**: Check security group allows inbound 80 (HTTP) and 443 (HTTPS). Ensure Caddy is up and `APP_DOMAIN` matches the host (and the Route 53 A record).

## Script reference

| Script | Purpose |
|--------|--------|
| `bootstrap/go.sh` | Only file you copy to EC2. Installs git if needed, clones repo if missing, then runs `scripts/ec2/run.sh`. |
| `scripts/ec2/run.sh` | Orchestrator: repo-sync, install-deps, elastic-ip, Route 53 (update A record), stack. |
| `scripts/ec2/install-deps.sh` | Installs docker (and docker compose plugin) on Amazon Linux. |
| `scripts/ec2/elastic-ip.sh` | Ensures instance has an Elastic IP; allocates and associates one if missing. |
| `scripts/ec2/repo-sync.sh` | Pulls the repo (fetch, checkout, pull). |
| `scripts/ec2/route53-update.sh` | UPSERTs A record for `<repo-name>.binaryexperiments.com` to instance public IP. Fails if no IP (run after elastic-ip). |
| `scripts/ec2/rebrand-env.sh` | Rebrands bootstrap env samples: set APP_DOMAIN, DB name, generate passwords; keeps third-party keys as placeholders. Run from repo root with APP_DOMAIN or REPO_URL. |
| `scripts/ec2/stack.sh` | Builds and runs `docker-compose.prod.yml`. |
