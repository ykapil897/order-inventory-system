FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cache-friendly)
RUN apk add --no-cache curl ca-certificates \
 && curl -L https://github.com/grafana/k6/releases/download/v0.49.0/k6-v0.49.0-linux-amd64.tar.gz \
 | tar -xz \
 && mv k6-v0.49.0-linux-amd64/k6 /usr/local/bin/k6
 
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Prisma client generation (NO migration here)
RUN npx prisma generate

# Default command (overridden by docker-compose)
CMD ["npm", "run", "dev"]
