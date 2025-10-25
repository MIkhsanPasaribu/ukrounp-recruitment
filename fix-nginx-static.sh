#!/bin/bash

# Fix nginx configuration to serve static files from public root

cat > /tmp/nginx_static_fix.conf << 'EOF'
# Add static files serving for root public files
    # Serve static files from public root (for files like ukro full.jpg, GAZA - UKRO.gif)
    location ~ ^/([^/]+\.(jpg|jpeg|png|gif|ico|svg|webp|pdf))$ {
        root /var/www/ukro-recruitment/public;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
        try_files $uri =404;
    }

    # Static files dari Next.js build
    location /_next/static/ {
        alias /var/www/ukro-recruitment/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Public static files dalam subfolder
    location /images/ {
        alias /var/www/ukro-recruitment/public/images/;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    location /docs/ {
        alias /var/www/ukro-recruitment/public/docs/;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    # Favicon and robots
    location = /favicon.ico {
        root /var/www/ukro-recruitment/public;
        log_not_found off;
        access_log off;
    }

    location = /robots.txt {
        root /var/www/ukro-recruitment/public;
        log_not_found off;
        access_log off;
        allow all;
    }
EOF

echo "Static files configuration created at /tmp/nginx_static_fix.conf"
echo "Next: Add this configuration to your nginx server block before the main location / block"