# --- Default VPC / subnet lookup (used when vpc_id or subnet_id are not provided) ---

data "aws_vpc" "default" {
  count   = var.vpc_id == "" ? 1 : 0
  default = true
}

data "aws_subnets" "default" {
  count = var.subnet_id == "" ? 1 : 0

  filter {
    name   = "vpc-id"
    values = [local.vpc_id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

locals {
  vpc_id    = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.default[0].id
  subnet_id = var.subnet_id != "" ? var.subnet_id : data.aws_subnets.default[0].ids[0]
}

# --- Latest Amazon Linux 2023 ARM64 AMI ---

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-kernel-6.1-arm64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

# --- Security group ---

resource "aws_security_group" "this" {
  name        = "${var.project_name}-sg"
  description = "Allow inbound HTTP/HTTPS for ${var.project_name}"
  vpc_id      = local.vpc_id

  dynamic "ingress" {
    for_each = var.ingress_ports
    content {
      description = "TCP ${ingress.value}"
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

# --- EC2 instance ---

resource "aws_instance" "this" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = local.subnet_id
  vpc_security_group_ids = [aws_security_group.this.id]
  iam_instance_profile   = var.iam_instance_profile

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = var.volume_type
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh.tftpl", {
    go_sh_b64          = base64encode(var.go_sh_content)
    repo_url           = var.repo_url
    github_token       = var.github_token
    branch             = var.branch
    r53_hosted_zone_id = var.r53_hosted_zone_id
    r53_domain_suffix  = var.r53_domain_suffix
    record_name        = var.record_name
    ssm_param_api_env  = var.ssm_param_api_env
    ssm_param_web_env  = var.ssm_param_web_env
  }))

  user_data_replace_on_change = false

  tags = {
    Name = var.project_name
  }
}

# --- Elastic IP (replaces scripts/ec2/elastic-ip.sh when using Terraform) ---

resource "aws_eip" "this" {
  instance = aws_instance.this.id
  domain   = "vpc"

  tags = {
    Name = var.project_name
  }
}

# --- Route 53 A record (replaces scripts/ec2/route53-update.sh when using Terraform) ---

resource "aws_route53_record" "this" {
  zone_id = var.r53_hosted_zone_id
  name    = var.record_name
  type    = "A"
  ttl     = 300
  records = [aws_eip.this.public_ip]
}
