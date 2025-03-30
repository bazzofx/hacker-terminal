# Use Ubuntu as base image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update system and install dependencies (Git, Curl, Node.js, Nginx, Certbot)
RUN apt update -y && apt upgrade -y 
#Install Git
RUN apt install git -y
#Install NPM Package (on the OS)
RUN apt install npm -y
#Install Nginx Server 
RUN apt install nginx -y
#Install certbot
RUN apt install certbot -y && apt install python3-certbot-nginx -y
#Install NextJS
RUN npm install nextjs -y



# Clone the repository
RUN git clone https://github.com/bazzofx/hacker-terminal.git /app

# Set working directory
WORKDIR /app

# Install npm dependencies
RUN npm install 2>/dev/null

# Set environment variable for API key
ARG API_KEY
ARG SERVERNAME
ENV SERVERNAME=${SERVERNAME}
RUN echo NEXT_PUBLIC_APIDEEPSEEK="$API_KEY" > .env.local

# Expose necessary ports
EXPOSE 80 443 3000

# Copy and configure Nginx reverse proxy
RUN echo 'server {\n\
    listen 80;\n\
    server_name ${SERVERNAME};\n\
    location / {\n\
        proxy_pass http://localhost:3000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
}' > /etc/nginx/sites-available/hackerterminal

# Ensure Nginx is enabled
RUN service nginx start || true

# Define startup script to start both Nginx and the app
CMD service nginx start && npm run production
