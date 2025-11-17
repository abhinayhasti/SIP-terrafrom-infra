#!/bin/bash

# Get .env.local file from SecretsManager
aws secretsmanager get-secret-value --secret-id $SECRET_DOTENV --region $AWS_DEFAULT_REGION --output text --query SecretString  > /var/www/.env

# Check .env.local is populated
[[ -s "/var/www/.env" ]] || { echo ".env is empty, exiting"; exit 1; }

# Start node
yarn build
npx serve -s build -l 8000
