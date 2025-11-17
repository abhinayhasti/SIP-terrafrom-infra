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

variable "dns_domain" {
  type        = string
  description = "Domain name (e.g. sagecloudops.com)"
}

variable "dns_client" {
  type        = string
  description = "DNS entry for client"
}

variable "dns_server" {
  type        = string
  description = "DNS entry for server"
}

################################################################################
# Cloudflare
################################################################################
#variable "cloudflare_zone" {
#  type        = string
#  description = "Cloudflare Zone ID"
#}

################################################################################
# Inputs from other modules
################################################################################
# VPC
variable "vpc_id" {
  type        = string
  description = "ID of the VPC"
}

variable "public_subnets" {
  type        = list(string)
  description = "List of IDs of Public Subnets"
}

# Cloudflare Prefix Lists
#variable "pfl_cloudflare_ipv4" {
#  type        = string
#  description = "ID of Cloudflare IPv4 Prefix List"
#}

#variable "pfl_cloudflare_ipv6" {
#  type        = string
#  description = "ID of Cloudflare IPv6 Prefix List"
#}

# S3
variable "logs_bucket_name" {
  type        = string
  description = "Name of the S3 Bucket for Logs"
}
