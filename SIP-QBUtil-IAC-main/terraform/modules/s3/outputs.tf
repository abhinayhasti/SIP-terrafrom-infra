################################################################################
# Deployment bucket
################################################################################
output "deployment_bucket_name" {
  value = aws_s3_bucket.deployment.id
}

output "deployment_bucket_arn" {
  value = aws_s3_bucket.deployment.arn
}

################################################################################
# Logs bucket
################################################################################
output "logs_bucket_name" {
  value = aws_s3_bucket.logs.id
}

output "logs_bucket_arn" {
  value = aws_s3_bucket.logs.arn
}
