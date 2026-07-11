#!/bin/bash
# EC2 User Data - runs on first boot of t3.micro Amazon Linux 2023
# Installs: Node 20, Redis 7, Nginx, PM2

set -e

dnf update -y

# Node 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# Redis 7
dnf install -y redis7
systemctl enable redis
systemctl start redis

# Nginx
dnf install -y nginx
systemctl enable nginx
systemctl start nginx

# PM2
npm install -g pm2

# Configure Redis for localhost only
sed -i 's/^bind 127.0.0.1 -::1/bind 127.0.0.1/' /etc/redis/redis.conf || true
systemctl restart redis

# Create app directory
mkdir -p /home/ec2-user/app
chown -R ec2-user:ec2-user /home/ec2-user/app

# Nginx config will be copied separately via deploy script
echo "EC2 setup complete"