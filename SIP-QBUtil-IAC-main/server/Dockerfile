FROM node:20-bookworm-slim

RUN apt-get update
RUN apt-get install -y --no-install-recommends python3  curl unzip
RUN curl --insecure "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install
#RUN apk add --no-cache aws-cli

WORKDIR /var/www

COPY . .
RUN yarn install
RUN npm i serve --global

EXPOSE 8000
CMD ["/bin/bash", "/var/www/devops/entrypoint.sh"]