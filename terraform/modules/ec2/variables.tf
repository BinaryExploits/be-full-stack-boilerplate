variable "project_name" {
  description = "Name used for resource tags and the security group"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t4g.medium"
}

variable "volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 64
}

variable "volume_type" {
  description = "Root EBS volume type"
  type        = string
  default     = "gp3"
}

variable "iam_instance_profile" {
  description = "Name of the IAM instance profile to attach"
  type        = string
  default     = "instanceRole"
}

variable "ingress_ports" {
  description = "List of TCP ports to allow inbound from 0.0.0.0/0"
  type        = list(number)
  default     = [80, 443]
}

variable "vpc_id" {
  description = "VPC ID. Leave empty to use the default VPC."
  type        = string
  default     = ""
}

variable "subnet_id" {
  description = "Subnet ID. Leave empty to use the first default subnet."
  type        = string
  default     = ""
}

# --- Bootstrap / user_data ---

variable "go_sh_content" {
  description = "Raw contents of bootstrap/go.sh (read via file() in root module)"
  type        = string
}

variable "repo_url" {
  description = "Git repository URL (HTTPS or SSH)"
  type        = string
}

variable "github_token" {
  description = "GitHub PAT for private HTTPS clones (leave empty for SSH)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "r53_hosted_zone_id" {
  description = "Route 53 hosted zone ID for DNS record creation"
  type        = string
  default     = "Z0760970XXLTORHSTKO2"
}

variable "r53_domain_suffix" {
  description = "Domain suffix used for Route 53 A records"
  type        = string
  default     = "binaryexperiments.com"
}
