# Use Node.js 20 Alpine for better compatibility
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (use PORT env var)
EXPOSE 10000

# Health check (corrected port and endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/api/v1/papamalickteuw/users || exit 1

# Run migrations before starting the app (with error handling)
CMD ["sh", "-c", "npm run migration:run || echo 'Migrations failed, continuing...' && npm run start:prod"]
