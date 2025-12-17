FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cache-friendly)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Prisma client generation (NO migration here)
RUN npx prisma generate

# Default command (overridden by docker-compose)
CMD ["npm", "run", "dev"]
