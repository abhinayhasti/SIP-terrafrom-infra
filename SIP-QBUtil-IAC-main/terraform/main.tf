################################################################################
# Providers
################################################################################
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
    }
  }
}

provider "cloudflare" {
  # API token is set with env var CLOUDFLARE_API_TOKEN
}

################################################################################
# Locals
################################################################################
locals {
  azs = slice(data.aws_availability_zones.available.names, 0, var.number_of_azs)
}

# Data Sources
data "aws_region" "current" {}
data "aws_availability_zones" "available" {}
data "aws_caller_identity" "current" {}

################################################################################
# S3 Module
################################################################################
module "s3" {
  source = "./modules/s3"

  # Core variables
  project     = var.project
  environment = var.environment
  aws_region  = var.aws_region
}


################################################################################
# VPC Module
################################################################################
module "vpc" {
  source     = "./modules/vpc"
  depends_on = [module.s3]

  # Core variables
  project     = var.project
  environment = var.environment
  aws_region  = var.aws_region

  # Local variables
  azs                  = local.azs
  cidr                 = var.cidr
  #cloudflare_ipv4_list = split(",", var.cloudflare_ipv4_list)
  #cloudflare_ipv6_list = split(",", var.cloudflare_ipv6_list)

  # Inputs from other modules
  logs_bucket_arn = module.s3.logs_bucket_arn
}

################################################################################
# ALB Module
################################################################################
module "alb" {
  source     = "./modules/alb"
  depends_on = [module.s3, module.vpc]

  # Core variables
  project     = var.project
  environment = var.environment
  aws_region  = var.aws_region
  dns_domain  = var.dns_domain
  dns_client  = var.dns_client
  dns_server  = var.dns_server

  # Cloudflare variables
  #cloudflare_zone = var.cloudflare_zone

  # Inputs from other modules
  vpc_id              = module.vpc.vpc_id
  public_subnets      = module.vpc.public_subnets
  #pfl_cloudflare_ipv4 = module.vpc.pfl_cloudflare_ipv4
  #pfl_cloudflare_ipv6 = module.vpc.pfl_cloudflare_ipv6
  logs_bucket_name    = module.s3.logs_bucket_name
}

################################################################################
# ECS Cluster Module
################################################################################
module "ecs_cluster" {
  source = "./modules/ecs_cluster"

  # Core variables
  project     = var.project
  environment = var.environment
}

################################################################################
# ECS Service Module - Client
################################################################################
module "ecs_service_client" {
  source = "./modules/ecs_service"

  depends_on = [module.vpc, module.ecs_cluster, module.alb]

  # Core variables
  project     = var.project
  environment = var.environment

  # Local variables
  service_name             = "client"
  task_count               = 1
  target_group_protocol    = "HTTP"
  target_group_target_type = "ip"
  health_check_path        = "/"
  host_header              = "${var.dns_client}.${var.dns_domain}"
  container_image          = var.client_image
  cpu                      = 512
  memory                   = 1024
  container_port           = 8000
  dns_domain               = var.dns_domain
  dns_hostname             = var.dns_client
  secret_dotenv_name       = var.client_secret_dotenv_name # This is created outside of terraform to protect the secret from being stored in the state file

  # Cloudflare variables
  #cloudflare_zone = var.cloudflare_zone

  # Inputs from other modules
  vpc_id             = module.vpc.vpc_id
  subnets            = module.vpc.private_subnets
  ecs_cluster_id     = module.ecs_cluster.ecs_cluster_id
  alb_arn            = module.alb.alb_arn
  alb_listener_arn   = module.alb.alb_listener_arn
  alb_dns            = module.alb.alb_dns
  alb_security_group = module.alb.alb_security_group
}

################################################################################
# ECS Service Module - Server
################################################################################
module "ecs_service_server" {
  source = "./modules/ecs_service"

  depends_on = [module.vpc, module.ecs_cluster, module.alb]

  # Core variables
  project     = var.project
  environment = var.environment

  # Local variables
  service_name             = "server"
  task_count               = 1
  target_group_protocol    = "HTTP"
  target_group_target_type = "ip"
  health_check_path        = "/callback"
  host_header              = "${var.dns_server}.${var.dns_domain}"
  container_image          = var.server_image
  cpu                      = 512
  memory                   = 1024
  container_port           = 8000
  dns_domain               = var.dns_domain
  dns_hostname             = var.dns_server
  secret_dotenv_name       = var.server_secret_dotenv_name # This is created outside of terraform to protect the secret from being stored in the state file

  # Cloudflare variables
  #cloudflare_zone = var.cloudflare_zone

  # Inputs from other modules
  vpc_id             = module.vpc.vpc_id
  subnets            = module.vpc.private_subnets
  ecs_cluster_id     = module.ecs_cluster.ecs_cluster_id
  alb_arn            = module.alb.alb_arn
  alb_listener_arn   = module.alb.alb_listener_arn
  alb_dns            = module.alb.alb_dns
  alb_security_group = module.alb.alb_security_group
}

################################################################################
# Outputs
################################################################################

output "client_url" {
  value = "https://${var.dns_client}.${var.dns_domain}"
}

output "server_url" {
  value = "https://${var.dns_server}.${var.dns_domain}"
}

output "elb_url" {
  value = module.alb.alb_dns
}
