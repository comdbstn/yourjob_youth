# Multi-stage build for YourJob Youth Platform
FROM node:18-alpine AS frontend-build

# Build Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy frontend build
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Create required directories
RUN mkdir -p /var/log/nginx

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
