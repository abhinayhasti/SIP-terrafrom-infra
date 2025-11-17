################################################################################
# ECS Cluster
################################################################################
output "ecs_cluster_arn" {
  value = aws_ecs_cluster.ecs_cluster.arn
}

output "ecs_cluster_id" {
  value = aws_ecs_cluster.ecs_cluster.id
}
