################################################################################
# Core
################################################################################
variable "project" {
  type        = string
  description = "Name of the Project"
}

variable "environment" {
  type        = string
  description = "Name of the Environment"
}

################################################################################
# Local
################################################################################
variable "service_name" {
  type        = string
  description = "Name of the ECS Service"
}

variable "task_count" {
  type        = number
  description = "Number of tasks to run"
}

variable "target_group_protocol" {
  type        = string
  description = "Protocol of the target group"
}

variable "target_group_target_type" {
  type        = string
  description = "Target type of the target group"
}

variable "health_check_path" {
  type        = string
  description = "Path to use for the health check"
}

variable "host_header" {
  type        = string
  description = "DNS endpoint to use for host header forwarding (e.g. client.sagecloudops.com)"
}

variable "container_image" {
  type        = string
  description = "Container image to use for the ECS task"
}

variable "cpu" {
  type        = number
  description = "CPU units to use for the ECS task"
}

variable "memory" {
  type        = number
  description = "Memory to use for the ECS task"
}

variable "container_port" {
  type        = number
  description = "Port to use for the ECS task"
}

#variable "cloudflare_zone" {
#  type        = string
#  description = "ID of the Cloudflare zone"
#}

variable "secret_dotenv_name" {
  type        = string
  description = "Name of the SecretsManager dotenv file"
}

################################################################################
# Inputs from other modules
################################################################################
variable "vpc_id" {
  type        = string
  description = "ID of the VPC"
}

variable "subnets" {
  type        = list(string)
  description = "List of subnet IDs"
}

variable "ecs_cluster_id" {
  type        = string
  description = "ID of the ECS cluster"
}

variable "alb_arn" {
  type        = string
  description = "ARN of the ALB"
}

variable "alb_listener_arn" {
  type        = string
  description = "ARN of the ALB listener"
}

variable "alb_dns" {
  type        = string
  description = "DNS name of the ALB"
}

variable "alb_security_group" {
  type        = string
  description = "ID of the ALB security group"
}

variable "dns_domain" {
  type        = string
  description = "Domain name (e.g. sagecloudops.com)"
}

variable "dns_hostname" {
  type        = string
  description = "Host name (e.g. client)"
}
