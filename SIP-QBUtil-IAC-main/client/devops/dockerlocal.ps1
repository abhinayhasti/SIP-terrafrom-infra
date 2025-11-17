Import-Module AWS.Tools.ECR

$Env:AWS_DEFAULT_REGION = "us-east-1"
$SECRET_DOTENV = "/qbutil/dev/client"
$IMAGE_NAME = "qbutil-client"
$ECR = "460943262264.dkr.ecr.us-east-1.amazonaws.com"

(Get-ECRLoginCommand).Password | docker login --username AWS --password-stdin $ecr

docker build -t $IMAGE_NAME -t "$($ECR)/$($IMAGE_NAME):latest" .
docker rm -f $IMAGE_NAME && docker run -d -p 8000:8000 -e "AWS_ACCESS_KEY_ID=$($ENV:AWS_ACCESS_KEY_ID)" -e "AWS_SECRET_ACCESS_KEY=$($ENV:AWS_SECRET_ACCESS_KEY)" -e "AWS_DEFAULT_REGION=$($ENV:AWS_DEFAULT_REGION)" -e "AWS_SESSION_TOKEN=$($ENV:AWS_SESSION_TOKEN)" -e "SECRET_DOTENV=$($SECRET_DOTENV)" --name $IMAGE_NAME $IMAGE_NAME

docker push "$($ECR)/$($IMAGE_NAME):latest"

docker logs $IMAGE_NAME --follow