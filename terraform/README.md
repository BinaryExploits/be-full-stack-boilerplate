# Terraform — EC2 provisioning

Provisions an EC2 instance (Amazon Linux 2023, ARM64) with a security group, an Elastic IP, and a Route 53 A record (`project_name.r53_domain_suffix`), then auto-bootstraps the app via `user_data` running `go.sh`. The deploy scripts skip EIP/Route 53 when Terraform has already set them.

**Version control:** Commit `.terraform.lock.hcl` so everyone uses the same provider versions (reproducible builds). It contains only provider version hashes — no secrets; safe for public repos. Do not commit `terraform.tfvars` (use it for your project/credentials).

## Prerequisites

- Terraform >= 1.5
- AWS CLI configured (`aws configure` or SSO). If using SSO: `aws sso login --profile=your-profile` (e.g. `aws sso login --profile=be-wordpress`), then set `aws_profile` in `terraform.tfvars` to that profile.
- The **instanceRole** IAM instance profile must already exist in your account.
- **No key pair required** — connect to the instance via **SSM Session Manager** (`aws ssm start-session --target <instance-id>`).

## Usage

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars — set project_name, repo_url, github_token, r53_hosted_zone_id, r53_domain_suffix

terraform init
terraform plan
terraform apply
```

**Optional — production env files via SSM:** To have the first deploy use real `.env.api.production` and `.env.web.production` (so you don't have to SSM in and edit them), create the files locally (e.g. copy from `bootstrap/env.*.production.sample`, fill in secrets), set `env_api_file` and `env_web_file` in `terraform.tfvars` to their paths (relative to `terraform/`), and run `terraform apply`. Terraform will upload the file contents to SSM Parameter Store and the instance will pull them at boot. Env file contents are stored in Terraform state and in SSM — use an encrypted backend and ensure **instanceRole** has `ssm:GetParameter` (and `kms:Decrypt` for SecureString) in addition to Session Manager. If you leave these variables empty, the instance copies from the bootstrap samples as before.

The instance will fully bootstrap itself on first boot (clone, install Docker, docker-compose up). The A record will already point to the instance's Elastic IP. Monitor progress:

```bash
# Get instance ID from output
terraform output instance_id

# SSM in and tail the boot log
aws ssm start-session --target <instance-id>
sudo tail -f /var/log/user-data.log
```

## Destroy

```bash
terraform destroy
```

Terraform will destroy the instance, security group, Elastic IP, and Route 53 record.
