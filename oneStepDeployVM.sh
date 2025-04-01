#!/bin/bash
# Set environment variables
ApiDeepSeek="YOUR_REAL_DEEP_SEEK_API"
domainName="microsoft.org"

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Build the Docker image
docker build -t hacker-terminal --build-arg API_KEY=$ApiDeepSeek --build-arg SERVERNAME=$domainName .

# Run the Docker container
docker run -d --name hacker-terminal -p 80:80 -p 443:443 -p 3000:3000 hacker-terminal

