################################################################################
# VPC
################################################################################
output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnets" {
  value = aws_subnet.public.*.id
}

output "private_subnets" {
  value = aws_subnet.private.*.id
}

#output "pfl_cloudflare_ipv4" {
#  value = aws_ec2_managed_prefix_list.cloudflare_ipv4.id
#}

#output "pfl_cloudflare_ipv6" {
#  value = aws_ec2_managed_prefix_list.cloudflare_ipv6.id
#}
