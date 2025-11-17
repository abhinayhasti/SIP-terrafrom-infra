################################################################################
# ECS Service - Security Group Resources
################################################################################

# ECS Task Security Group
resource "aws_security_group" "service" {
  name   = "${var.project}-${var.environment}-ecs-${var.service_name}"
  vpc_id = var.vpc_id

  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [var.alb_security_group]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
