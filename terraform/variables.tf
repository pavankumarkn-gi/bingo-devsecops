variable "aws_region" {
  description = "AWS region for provisioning"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance size required for Jenkins + SonarQube + Docker"
  type        = string
  default     = "t2.large"
}

variable "key_name" {
  description = "Name of the AWS EC2 Key Pair for SSH access"
  type        = string
  default     = "YOUR_EC2_KEY_NAME"
}

variable "my_ip" {
  description = "Your personal IP address in CIDR format (e.g. 103.21.54.12/32) for secure SSH access"
  type        = string
  default     = "0.0.0.0/0"
}
