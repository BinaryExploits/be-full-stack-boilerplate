output "instance_id" {
  description = "EC2 instance ID"
  value       = module.ec2.instance_id
}

output "public_ip" {
  description = "Public IP (ephemeral until Elastic IP is attached by deploy scripts)"
  value       = module.ec2.public_ip
}

output "security_group_id" {
  description = "Security group ID"
  value       = module.ec2.security_group_id
}

output "instance_arn" {
  description = "ARN of the EC2 instance"
  value       = module.ec2.instance_arn
}
