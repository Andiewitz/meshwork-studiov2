# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
RUN npm run build

# Runtime stage
FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy production build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/connect-pg-simple/table.sql ./dist/table.sql

# Copy drizzle config for schema push at startup
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/shared ./shared

# Install production deps + drizzle-kit for schema sync
RUN npm cache clean --force && npm ci --omit=dev && npm install drizzle-kit --no-save

# Set environment variables
ENV NODE_ENV=production

# Push schema then start app (DATABASE_URL available at runtime, not build)
CMD ["sh", "-c", "npx drizzle-kit push && node dist/index.cjs"]
