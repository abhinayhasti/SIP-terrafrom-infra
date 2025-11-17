################################################################################
# ECS Service - ECS Resources
################################################################################
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource "aws_cloudwatch_log_group" "service" {
  name              = "/ecs/${var.project}/${var.environment}/${var.service_name}"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "service" {
  family                   = "${var.project}-${var.environment}-ecs-${var.service_name}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.project}-${var.environment}-ecs-${var.service_name}"
      image     = var.container_image
      cpu       = var.cpu
      memory    = var.memory
      essential = true

      environment = [
        { name = "SECRET_DOTENV", value = var.secret_dotenv_name }
      ]


      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-create-group  = "true",
          awslogs-group         = aws_cloudwatch_log_group.service.name,
          awslogs-region        = data.aws_region.current.name,
          awslogs-stream-prefix = "ecs"
      } }

      portMappings = [
        {
          containerPort = var.container_port
        }
      ]
    },
  ])
}

resource "aws_ecs_service" "service" {
  name                              = "${var.project}-${var.environment}-ecs-${var.service_name}"
  cluster                           = var.ecs_cluster_id
  task_definition                   = aws_ecs_task_definition.service.arn
  desired_count                     = var.task_count
  health_check_grace_period_seconds = 300
  enable_execute_command            = true

  load_balancer {
    target_group_arn = aws_lb_target_group.service.arn
    container_name   = "${var.project}-${var.environment}-ecs-${var.service_name}"
    container_port   = var.container_port
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  network_configuration {
    subnets         = var.subnets
    security_groups = [aws_security_group.service.id]
  }
}

