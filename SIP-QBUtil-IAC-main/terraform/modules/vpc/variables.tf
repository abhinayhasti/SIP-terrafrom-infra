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

variable "aws_region" {
  type        = string
  description = "AWS Region"
}

################################################################################
# Local
################################################################################
variable "azs" {
  type        = list(string)
  description = "Availability Zones"
}

variable "cidr" {
  type        = string
  description = "CIDR Block for VPC"
}

#variable "cloudflare_ipv4_list" {
#  type        = list(string)
#  description = "List of Cloudflare IPv4 addresses"
#}

#variable "cloudflare_ipv6_list" {
#  type        = list(string)
#  description = "List of Cloudflare IPv6 addresses"
#}

################################################################################
# Inputs from other modules
################################################################################
variable "logs_bucket_arn" {
  type        = string
  description = "ARN of the S3 bucket for logs"
}
