# Terraform — EC2 provisioning

Provisions an EC2 instance (Amazon Linux 2023, ARM64) with a security group and auto-bootstraps the app via `user_data` running `go.sh`. Elastic IP and Route 53 are handled by the existing deploy scripts, not Terraform.

## Prerequisites

- Terraform >= 1.5
- AWS CLI configured (`aws configure` or SSO)
- The **instanceRole** IAM instance profile must already exist in your account

## Usage

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars — set project_name, repo_url, github_token

terraform init
terraform plan
terraform apply
```

**Optional — production env files via SSM:** To have the first deploy use real `.env.api.production` and `.env.web.production` (so you don't have to SSM in and edit them), create the files locally (e.g. copy from `bootstrap/env.*.production.sample`, fill in secrets), set `env_api_file` and `env_web_file` in `terraform.tfvars` to their paths (relative to `terraform/`), and run `terraform apply`. Terraform will upload the file contents to SSM Parameter Store and the instance will pull them at boot. Env file contents are stored in Terraform state and in SSM — use an encrypted backend and ensure **instanceRole** has `ssm:GetParameter` (and `kms:Decrypt` for SecureString) in addition to Session Manager. If you leave these variables empty, the instance copies from the bootstrap samples as before.

The instance will fully bootstrap itself on first boot (clone, install Docker, Elastic IP, Route 53, docker-compose up). Monitor progress:

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

Note: this does **not** release the Elastic IP allocated by the deploy scripts. Release it manually in the AWS console if no longer needed.
