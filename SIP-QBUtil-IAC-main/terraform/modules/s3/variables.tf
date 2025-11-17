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
