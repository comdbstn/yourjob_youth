# Multi-stage build for YourJob Youth Platform
FROM node:18-alpine AS frontend-build

# Build Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy frontend build (webpack outputs to dist/)
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Create simple nginx configuration for static files
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /static/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Create required directories
RUN mkdir -p /var/log/nginx

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
