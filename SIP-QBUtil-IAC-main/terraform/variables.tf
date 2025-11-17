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
# VPC Module
################################################################################
variable "number_of_azs" {
  type        = number
  description = "Number of Availability Zones"
  validation {
    condition     = var.number_of_azs >= 2
    error_message = "There must be at least 2 Availability Zones"
  }
}

variable "cidr" {
  type        = string
  description = "CIDR Block for VPC"
}

#variable "cloudflare_ipv4_list" {
#  type        = string
#  description = "List of comma-separated Cloudflare IPv4 addresses"
#}

#variable "cloudflare_ipv6_list" {
#  type        = string
#  description = "List of comma-separated Cloudflare IPv6 addresses"
#}

################################################################################
# ECS Service Module - Client
################################################################################
variable "client_secret_dotenv_name" {
  type        = string
  description = "Name of the SecretsManager dotenv file"
}

variable "client_image" {
  type        = string
  description = "Image Name for the client"
}

################################################################################
# ECS Service Module - Server
################################################################################
variable "server_secret_dotenv_name" {
  type        = string
  description = "Name of the SecretsManager dotenv file"
}

variable "server_image" {
  type        = string
  description = "Image Name for the server"
}
