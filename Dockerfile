# Use Ubuntu as base image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update system and install dependencies (Git, Curl, Node.js, Nginx, Certbot)
RUN apt update -y && apt upgrade -y  2>/dev/null
#Install Git
RUN apt install git -y
#Install Nginx Server
RUN apt install nginx -y
#Install certbot
RUN apt install certbot -y && apt install python3-certbot-nginx -y
#Install NextJS + Latest Node Versions
RUN apt install curl -y
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install nodejs -y
RUN node -v && npm -v


# Clone the repository
RUN git clone https://github.com/bazzofx/hacker-terminal.git /app

# Set working directory
WORKDIR /app

# Install npm dependencies
RUN npm install  2>/dev/null

# Set environment variable for API key
ARG API_KEY
ARG SERVERNAME
ENV SERVERNAME=${NAME}
ENV NEXT_PUBLIC_APIDEEPSEEK=${API_KEY}
# Create .env.local file with API_KEY
RUN echo "NEXT_PUBLIC_APIDEEPSEEK=${API_KEY}" > .env.local

# Expose necessary ports
EXPOSE 80 443 3000

# Copy and configure Nginx reverse proxy
# Configure Nginx as a reverse proxy
RUN echo 'server {\n\
    listen 80;\n\
    server_name '"$NAME"';\n\
    return 301 https://$host$request_uri;\n\
}\n\
server {\n\
    listen 443 ssl;\n\
    server_name '"$NAME"';\n\
    ssl_certificate /etc/letsencrypt/live/$NAME/fullchain.pem;\n\
    ssl_certificate_key /etc/letsencrypt/live/$NAME/privkey.pem;\n\
    location / {\n\
        proxy_pass http://localhost:3000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto https;\n\
    }\n\
}' > /etc/nginx/sites-available/hackerterminal


# Copy startup script
COPY dockerScript/dockerEntrypoint.sh dockerEntrypoint.sh
RUN chmod +x dockerEntrypoint.sh


# Start Nginx Server and run Certbot Script to give server a SSL certificate
CMD ["dockerEntrypoint.sh"]

# Define startup script to start both Nginx and the app
CMD service nginx start && npm run production