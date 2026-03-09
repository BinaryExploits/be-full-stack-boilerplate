# Bootstrap: copy only `go.sh` to EC2

Copy **only** `bootstrap/go.sh` to your EC2 home directory. No other files need to be copied. **No SSH key pair is required** — connect via **AWS Systems Manager Session Manager** only.

## Copy to EC2

Connect via **Session Manager** (`aws sso login --profile=your-profile` then `aws ssm start-session --target <instance-id>`). Put `go.sh` in the instance **home folder** (`~`). Run `cd ~` first (Session Manager does not always start in your home directory), then create a new file and paste the contents of `bootstrap/go.sh` into `~/go.sh`, or upload the file via an SSM document or S3. Make it executable: **`chmod +x ~/go.sh`** (required before running).

## Configure once

When you copy `go.sh` to EC2, **edit the block at the top of the script once** and set:

- **REPO_URL** – Your repo URL (HTTPS or SSH), e.g. `https://github.com/org/repo.git`
- **GITHUB_TOKEN** – GitHub PAT for private HTTPS clone (leave empty if using an SSH `git@...` URL)
- **BRANCH** – Branch to deploy (e.g. `main` or a feature branch)

Then you can run `./go.sh full` without exporting secrets every time. You can still override with env vars when running if needed.

## Route 53

Set **R53_HOSTED_ZONE_ID** and **ROUTE53_DOMAIN_SUFFIX** in `go.sh` to your Route 53 zone and domain. On every run, the deploy checks and updates the A record for **`<repo-name>.<your-domain>`**. Ensure the instance has an **Elastic IP** and the **instanceRole** IAM role assigned.

## Run

After editing the script once:

```bash
./go.sh full
```

First run: `go.sh` installs git if missing, clones the repo, then runs `scripts/ec2/run.sh` (which installs docker, pulls, updates Route 53 A record for `<repo-name>.<your-domain>`, and deploys). Subsequent runs: repo already exists, so `go.sh` just runs `run.sh` (pull + Route 53 check/update + deploy).

## Production env files

The deploy expects `~/.env.api.production` and `~/.env.web.production` on the EC2 host. If they are missing, **run.sh** copies them from **`bootstrap/env.api.production.sample`** and **`bootstrap/env.web.production.sample`** (from the cloned repo). Before first deploy, run **`scripts/ec2/rebrand-env.sh`** from the repo root (e.g. `APP_DOMAIN=myapp.example.com ./scripts/ec2/rebrand-env.sh`) to set your domain, DB name, and generate new passwords in the samples; then copy the rebranded samples to EC2 or let the deploy copy them and edit only the third-party placeholders (Google, Rollbar, email). Set `API_ENV_FILE` and `WEB_ENV_FILE` if you use different paths.

## Full deployment guide

See [docs/deployment.md](../docs/deployment.md) for prerequisites, minimal steps, and troubleshooting.
