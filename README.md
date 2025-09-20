# hacker-terminal

If building with Docker + NGINX use the below

# Building with Docker
## Build the hacker-terminal image
```
docker build -t hacker-terminal --build-arg API_KEY=sk-DEEP__SEEK__API .
```
## Create an instance of the image
```
docker run -d --name hacker-terminal -p 3000:3000 hacker-terminal
```
## Nginx Config
You will need to have nginx running on your local server (outside docker) 
Create the below config
/etc/nginx/conf.d/hackerterminal.conf
```
upstream hacker_terminal_3000 {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name hacker.cybersamurai.com www.hacker.cybersamurai.com;

    access_log /var/log/nginx/hackerterminal.local.access.log;
    error_log /var/log/nginx/hackerterminal.local.error.log;

    location / {
        proxy_pass http://hacker_terminal_3000/;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
**Its important to have the ending  / at the end of the
proxy_pass, otherwise nginx will look for a file instead of the path
**
### Check the Nginx config with
```
nginx -
```
### Reload nginx
```
systemctl reload nginx
```

# Building without docker
Its also possible to run the server without docker just build like a normal Next.js app

```
npm run production
```



















