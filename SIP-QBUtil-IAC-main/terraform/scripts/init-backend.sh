#!/bin/bash

# This script is used to initialize the terraform backend (S3 Bucket)

# We should have two arguments - the project and environment names
if [ $# -ne 2 ]; then
    echo "Usage: $0 <project> <environment>"
    exit 1
fi
PROJECT=$1
ENVIRONMENT=$2
BUCKET="${PROJECT}-${ENVIRONMENT}-terraform"

# Create the bucket if it does not already exist. Enable versioning.
if aws s3 ls "s3://${BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "Creating S3 bucket: ${BUCKET}"
    aws s3 mb "s3://${BUCKET}"

    echo "Enabling versioning on bucket: ${BUCKET}"
    aws s3api put-bucket-versioning --bucket "${BUCKET}" --versioning-configuration Status=Enabled

    echo "Enabling default server side encryption on bucket: ${BUCKET}"
    aws s3api put-bucket-encryption --bucket "${BUCKET}" --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
else
    echo "Bucket ${BUCKET} already exists"
fi