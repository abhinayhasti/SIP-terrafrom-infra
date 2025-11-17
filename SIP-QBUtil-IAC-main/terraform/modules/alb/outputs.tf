################################################################################
# ALB
################################################################################
output "alb_arn" {
  value = aws_lb.alb.arn
}

output "alb_dns" {
  value = aws_lb.alb.dns_name
}

#output "acm_arn" {
#  value = aws_acm_certificate.alb.arn
#}

output "alb_listener_arn" {
  value = aws_lb_listener.alb.arn
}

output "alb_security_group" {
  value = aws_security_group.alb.id
}
