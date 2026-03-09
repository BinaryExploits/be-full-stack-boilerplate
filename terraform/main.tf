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
}
