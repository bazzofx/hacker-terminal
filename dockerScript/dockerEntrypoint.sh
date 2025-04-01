#!/bin/bash
#This script will be copied inside the Docker and run inside the docker to automate the SSL certificate process
# Start Nginx
service nginx start

# Allow time for Nginx to start
sleep 5

# Request SSL Certificate via Certbot (automatically agrees to terms)
certbot --nginx --non-interactive --agree-tos --email admin@$SERVERNAME -d $SERVERNAME

# Start the application
npm run start

# Keep container running
exec "$@"
