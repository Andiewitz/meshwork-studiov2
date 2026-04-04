# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy production build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/connect-pg-simple/table.sql ./dist/table.sql

# Install only production dependencies
RUN npm install --omit=dev

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
