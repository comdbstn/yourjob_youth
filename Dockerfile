# Multi-stage build for YourJob Youth Platform
FROM node:18-alpine AS frontend-build

# Build Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --prefer-offline
COPY frontend/ ./

# Set build-time environment variables with defaults
ENV REACT_APP_API_BASE_URL=https://yourjobyouth-production.up.railway.app
ENV REACT_APP_BFF_BASE_URL=https://yourjobyouth-production.up.railway.app
ENV REACT_APP_FIREBASE_API_KEY=AIzaSyAZBQTYJI6wVIh8xiBtdfxBPtzDTxxlk4c
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=your-5932b.firebaseapp.com
ENV REACT_APP_FIREBASE_PROJECT_ID=your-5932b
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=your-5932b.firebasestorage.app
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1007615852085
ENV REACT_APP_FIREBASE_APP_ID=1:1007615852085:web:78e6e0af8bd37dba0efb7c

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy frontend build (webpack outputs to dist/)
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Create optimized nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Security headers \
    add_header X-Frame-Options SAMEORIGIN always; \
    add_header X-Content-Type-Options nosniff always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Health check endpoint \
    location /health { \
        access_log off; \
        return 200 "healthy"; \
        add_header Content-Type text/plain; \
    } \
    \
    # Static assets caching \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Main React SPA routing \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Create required directories
RUN mkdir -p /var/log/nginx

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
