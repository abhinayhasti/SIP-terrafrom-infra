################################################################################
# ECS Service - ALB Resources
################################################################################
# ALB Target Group
resource "aws_lb_target_group" "service" {
  name        = "${var.project}-${var.environment}-ecs-${var.service_name}"
  port        = var.container_port
  protocol    = var.target_group_protocol
  vpc_id      = var.vpc_id
  target_type = var.target_group_target_type

  health_check {
    enabled             = true
    healthy_threshold   = 4
    unhealthy_threshold = 4
    interval            = 20
    timeout             = 15
    matcher             = "200,301,302"
    path                = var.health_check_path
  }

  stickiness {
    enabled = true
    type    = "lb_cookie"
  }
}

# ALB Listener rule with condition for host header, attaches to existing ALB
resource "aws_alb_listener_rule" "service" {
  listener_arn = var.alb_listener_arn
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.service.arn
  }

  condition {
    host_header {
      values = [var.host_header]
    }
  }
}

# Cloudflare DNS entry
#resource "cloudflare_record" "dns_entry" {
#  zone_id = var.cloudflare_zone
#  name    = "${var.dns_hostname}.${var.dns_domain}."
#  value   = var.alb_dns
#  type    = "CNAME"
#  proxied = true
#  comment = "${var.project}-${var.environment}-${var.service_name}"
#}
