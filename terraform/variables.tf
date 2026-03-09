variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use (from ~/.aws/config)"
  type        = string
  default     = "default"
}

variable "project_name" {
  description = "Project name (used for tags and resource naming)"
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
  description = "IAM instance profile name to attach to the EC2 instance"
  type        = string
  default     = "instanceRole"
}

variable "ingress_ports" {
  description = "TCP ports to allow inbound"
  type        = list(number)
  default     = [80, 443]
}

variable "vpc_id" {
  description = "VPC ID (leave empty for default VPC)"
  type        = string
  default     = ""
}

variable "subnet_id" {
  description = "Subnet ID (leave empty for first default subnet)"
  type        = string
  default     = ""
}

variable "repo_url" {
  description = "Git repository URL"
  type        = string
}

variable "github_token" {
  description = "GitHub PAT for private HTTPS clones"
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
  description = "Route 53 hosted zone ID"
  type        = string
  default     = "Z0760970XXLTORHSTKO2"
}

variable "r53_domain_suffix" {
  description = "Domain suffix for Route 53 records"
  type        = string
  default     = "binaryexperiments.com"
}
