# Use Ubuntu as base image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update system and install dependencies (Git, Curl, Node.js, Nginx, Certbot)
RUN apt update -y && apt upgrade -y && \
    apt install -y git curl npm nginx certbot python3-certbot-nginx

# Clone the repository
RUN git clone https://github.com/bazzofx/hacker-terminal.git /app

# Set working directory
WORKDIR /app

# Install npm dependencies
RUN npm install

# Set environment variable for API key
ARG API_KEY
RUN echo NEXT_PUBLIC_APIDEEPSEEK="$API_KEY" > .env.local

# Expose necessary ports
EXPOSE 80 443 3000

# Copy and configure Nginx reverse proxy
RUN echo "server {\n\
    listen 80;\n\
    server_name hackerterminal.exploitmap.com;\n\
    location / {\n\
        proxy_pass http://localhost:3000;\n\
        proxy_set_header Host \$host;\n\
        proxy_set_header X-Real-IP \$remote_addr;\n\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto \$scheme;\n\
    }\n\
}" > /etc/nginx/sites-available/default

# Ensure Nginx is enabled
RUN systemctl enable nginx

# Define startup script to start both Nginx and the app
CMD service nginx start && npm run production
