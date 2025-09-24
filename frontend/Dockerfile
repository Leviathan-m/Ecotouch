# Simple static file server
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy static files
COPY public/ /app/

# Install http-server globally
RUN npm install -g http-server

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S impact -u 1001

# Set permissions
RUN chown -R impact:nodejs /app

# Switch to non-root user
USER impact

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start simple HTTP server
CMD ["http-server", "-p", "3000", "-c-1", "--cors"]
