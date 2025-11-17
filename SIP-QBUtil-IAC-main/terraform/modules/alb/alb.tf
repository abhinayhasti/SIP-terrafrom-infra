################################################################################
# ALB
################################################################################

# Security group for traffic incoming to ALB
resource "aws_security_group" "alb" {
  name        = "${var.project}-${var.environment}-sg-alb"
  description = "${var.project}-${var.environment} ALB Ingress"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Allow HTTPS (443) from Cloudflare Managed Prefix Lists"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
    #prefix_list_ids = [var.pfl_cloudflare_ipv4, var.pfl_cloudflare_ipv6]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-${var.environment}-sg-alb"
  }
}

# ALB
resource "aws_lb" "alb" {
  name               = "${var.project}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnets
  idle_timeout       = 120

  access_logs {
    bucket  = var.logs_bucket_name
    enabled = true
  }

  tags = {
    Name = "${var.project}-${var.environment}-alb"
  }
}

# ACM Cert
#resource "aws_acm_certificate" "alb" {
#  domain_name               = "${var.dns_client}.${var.dns_domain}"
#  subject_alternative_names = ["${var.dns_server}.${var.dns_domain}"]
#  validation_method         = "DNS"
#
#  tags = {
#    Name = "${var.project}-${var.environment}-alb"
#  }
#}

# Cloudflare DNS entry for ACM validation
#resource "cloudflare_record" "acm_validation" {
#  for_each = {
#    for dvo in aws_acm_certificate.alb.domain_validation_options : dvo.domain_name => {
#      name  = dvo.resource_record_name
#      value = dvo.resource_record_value
#      type  = dvo.resource_record_type
#    }
#  }
#  zone_id = var.cloudflare_zone
#  name    = each.value.name
#  value   = each.value.value
#  type    = each.value.type
#  ttl     = 120
#  proxied = false # ACM validation records must not be proxied
#  comment = "AWS ACM validation record for ${var.project}-${var.environment}"
#}

# ACM Cert Validation
# This doesn't actually create anything, it just waits until the ACM cert is validated.
#resource "aws_acm_certificate_validation" "alb" {
#  #depends_on      = [cloudflare_record.acm_validation]
#  certificate_arn = aws_acm_certificate.alb.arn
#}

data "aws_acm_certificate" "alb" {
  domain   = "intacct-planning.com"
  types       = ["IMPORTED"]
}

# ALB listener
resource "aws_lb_listener" "alb" {
  #depends_on = [aws_acm_certificate_validation.alb]

  load_balancer_arn = aws_lb.alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.alb.arn

   #Our default response is to return a 400.
   #Listener rules will be added for each service and forward to the correct target group.
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Bad request."
      status_code  = "400"
    }
  }
}
