################################################################################
# Providers
################################################################################
# This is required to use the Cloudflare provider in a sub module
# See https://www.terraform.io/upgrade-guides/0-13.html#explicit-provider-source-locations
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}
