# --- SSM parameters for production env files (optional) ---
# When env_*_file paths are set, Terraform uploads the file contents to SSM.
# user_data on EC2 pulls them at boot and writes ~/.env.api.production and ~/.env.web.production.

resource "aws_ssm_parameter" "env_api" {
  count = var.env_api_file != "" ? 1 : 0

  name  = "/projects/${var.project_name}/env-api-production"
  type  = "SecureString"
  value = file(var.env_api_file)
}

resource "aws_ssm_parameter" "env_web" {
  count = var.env_web_file != "" ? 1 : 0

  name  = "/projects/${var.project_name}/env-web-production"
  type  = "SecureString"
  value = file(var.env_web_file)
}

module "ec2" {
  source = "./modules/ec2"

  project_name         = var.project_name
  instance_type        = var.instance_type
  volume_size          = var.volume_size
  volume_type          = var.volume_type
  iam_instance_profile = var.iam_instance_profile
  ingress_ports        = var.ingress_ports
  vpc_id               = var.vpc_id
  subnet_id            = var.subnet_id

  go_sh_content      = file("${path.root}/../bootstrap/go.sh")
  repo_url           = var.repo_url
  github_token       = var.github_token
  branch             = var.branch
  r53_hosted_zone_id = var.r53_hosted_zone_id
  r53_domain_suffix  = var.r53_domain_suffix
  record_name        = "${var.project_name}.${var.r53_domain_suffix}"

  ssm_param_api_env = var.env_api_file != "" ? aws_ssm_parameter.env_api[0].name : ""
  ssm_param_web_env = var.env_web_file != "" ? aws_ssm_parameter.env_web[0].name : ""
}
