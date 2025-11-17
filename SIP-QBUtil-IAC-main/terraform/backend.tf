################################################################################
# Backend
################################################################################

terraform {
  backend "s3" {
    bucket = "#{TF_BACKEND_S3_BUCKET}#"
    key    = "#{TF_BACKEND_S3_KEY}#"
    region = "#{AWS_REGION}#"
    dynamodb_table = "qbutility-stg-deployment-lock"
  }
}
