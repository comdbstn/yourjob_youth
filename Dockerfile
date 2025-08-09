# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# Set environment variables
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

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]