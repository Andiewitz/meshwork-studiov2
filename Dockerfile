# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
# VITE_RECAPTCHA_SITE_KEY is a public site key (not a secret) - passed via build arg
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
RUN npm run build

# Prune dev dependencies to save space and install drizzle-kit for runtime schema push
RUN npm prune --omit=dev --legacy-peer-deps
RUN npm install drizzle-kit tsx --no-save --legacy-peer-deps

# Runtime stage
FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy production build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copy pre-installed node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy drizzle config for schema push at startup
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/shared ./shared

# Set environment variables
ENV NODE_ENV=production

# Push schema then start app (DATABASE_URL available at runtime, not build)
CMD ["sh", "-c", "npx drizzle-kit push && node dist/index.cjs"]
