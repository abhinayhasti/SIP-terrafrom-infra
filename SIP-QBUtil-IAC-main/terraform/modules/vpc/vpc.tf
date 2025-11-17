################################################################################
# VPC
################################################################################
resource "aws_vpc" "this" {
  cidr_block = var.cidr

  tags = {
    Name = "${var.project}-${var.environment}-vpc"
  }
}

################################################################################
# Internet Gateway
################################################################################
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
}

################################################################################
# Subnets
################################################################################
# Public
resource "aws_subnet" "public" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.cidr, 4, count.index)
  availability_zone = element(var.azs, count.index)

  tags = {
    Name = "${var.project}-${var.environment}-public-${count.index}"
  }
}

# Private
resource "aws_subnet" "private" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.cidr, 4, count.index + 4)
  availability_zone = element(var.azs, count.index)

  tags = {
    Name = "${var.project}-${var.environment}-private-${count.index}"
  }
}

################################################################################
# NAT Gateways
################################################################################
# Create an EIP for each AZ
resource "aws_eip" "nat" {
  count = length(var.azs)

  domain = "vpc"

  tags = {
    Name = "${var.project}-${var.environment}-eip-${count.index}"
  }
}

# Create a NAT Gateway for each AZ
resource "aws_nat_gateway" "this" {
  count = length(var.azs)

  allocation_id = element(aws_eip.nat.*.id, count.index)
  subnet_id     = element(aws_subnet.public.*.id, count.index)

  tags = {
    Name = "${var.project}-${var.environment}-nat-${count.index}"
  }
}

################################################################################
# Route tables
################################################################################
# Public route table to route internet traffic to the internet gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${var.project}-${var.environment}-rtb-public"
  }
}

# Private route table for each AZ, routing internet traffic to respective NAT Gateway
resource "aws_route_table" "private" {
  count  = length(var.azs)
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.project}-${var.environment}-rtb-private-${count.index}"
  }
}

resource "aws_route" "private" {
  count                  = length(var.azs)
  route_table_id         = element(aws_route_table.private.*.id, count.index)
  nat_gateway_id         = element(aws_nat_gateway.this.*.id, count.index)
  destination_cidr_block = "0.0.0.0/0"
}

# Associate public route table with public subnets
resource "aws_route_table_association" "public" {
  count          = length(var.azs)
  subnet_id      = element(aws_subnet.public.*.id, count.index)
  route_table_id = aws_route_table.public.id
}

# Associate private route tables with private subnets
resource "aws_route_table_association" "private" {
  count          = length(var.azs)
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}

################################################################################
# Prefix Lists
################################################################################
# IPV4 Prefix list for cloudflare IP ranges
#resource "aws_ec2_managed_prefix_list" "cloudflare_ipv4" {
#  name           = "${var.project}-${var.environment}-pfl-cloudflare-ipv4"
#  address_family = "IPv4"
#  max_entries    = length(var.cloudflare_ipv4_list)
#}

#resource "aws_ec2_managed_prefix_list_entry" "cloudflare_ipv4" {
#  count = length(var.cloudflare_ipv4_list)
#
#  prefix_list_id = aws_ec2_managed_prefix_list.cloudflare_ipv4.id
#  cidr           = element(var.cloudflare_ipv4_list, count.index)
#}

# IPV6 Prefix list for cloudflare IP ranges
#resource "aws_ec2_managed_prefix_list" "cloudflare_ipv6" {
#  name           = "${var.project}-${var.environment}-pfl-cloudflare-ipv6"
#  address_family = "IPv6"
#  max_entries    = length(var.cloudflare_ipv6_list)
#}

#resource "aws_ec2_managed_prefix_list_entry" "cloudflare_ipv6" {
#  count = length(var.cloudflare_ipv6_list)
#
#  prefix_list_id = aws_ec2_managed_prefix_list.cloudflare_ipv6.id
#  cidr           = element(var.cloudflare_ipv6_list, count.index)
#}

################################################################################
# Flow logs
################################################################################
resource "aws_flow_log" "this" {
  log_destination      = var.logs_bucket_arn
  log_destination_type = "s3"
  traffic_type         = "ALL"
  vpc_id               = aws_vpc.this.id
}
