# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Declare build arg for Verdaccio token
ARG VERDACCIO_TOKEN

# Copy package files
COPY package.json package-lock.json* ./

# Configure Verdaccio registry authentication
RUN echo "@rblab:registry=https://npm.rodolfodebonis.com.br" > .npmrc && \
    echo "//npm.rodolfodebonis.com.br/:_authToken=${VERDACCIO_TOKEN}" >> .npmrc && \
    echo "registry=https://registry.npmjs.org/" >> .npmrc

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Declare build arg for Verdaccio token
ARG VERDACCIO_TOKEN

# Copy package files and install all dependencies (including dev)
COPY package.json package-lock.json* ./

# Configure Verdaccio registry authentication
RUN echo "@rblab:registry=https://npm.rodolfodebonis.com.br" > .npmrc && \
    echo "//npm.rodolfodebonis.com.br/:_authToken=${VERDACCIO_TOKEN}" >> .npmrc && \
    echo "registry=https://registry.npmjs.org/" >> .npmrc

RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source files
COPY . .

# Build the application with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Ensure public directory exists (Next.js might not create it)
RUN mkdir -p public

RUN npm run build

# Stage 3: Runner (Production Image)
FROM node:20-alpine AS runner
WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create .next directory and set permissions
RUN mkdir -p .next && \
    chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health_check', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})" || exit 1

# Start the application
CMD ["node", "server.js"]