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
