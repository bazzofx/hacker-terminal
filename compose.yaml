# Use a base image with Ubuntu
FROM ubuntu:20.04

# Set environment variables to avoid some interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install necessary dependencies
RUN apt update -y && apt upgrade -y && \
    apt install -y git curl npm

# Clone the repository
RUN git clone https://github.com/bazzofx/hacker-terminal.git /app

# Set working directory
WORKDIR /app

# Install npm dependencies
RUN npm install

# Set environment variable for API key
ARG API_KEY
RUN echo NEXT_PUBLIC_APIDEEPSEEK="$API_KEY" > .env.local


# Expose any necessary ports
EXPOSE 3000


# Build the application in production mode
CMD ["npm", "run", "production"]