# I'm using the official Node.js LTS image as the base
# Alpine version keeps the image size smaller
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# I'm copying package files first to leverage Docker layer caching
# This way, dependencies only reinstall when package.json changes
COPY package*.json ./

# Install dependencies
# Using npm ci for faster, reliable, reproducible builds
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Create a non-root user for security
# I don't want the app running as root inside the container
RUN addgroup -g 1001 -S nodejs && \
    adduser -S devflow -u 1001

# Make sure the nodejs user owns the app directory and has write permissions
RUN chown -R devflow:nodejs /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/backend/db
USER devflow

# Expose the port the app runs on
EXPOSE 3000

# Add health check to make sure the container is working properly
# I'm checking the health endpoint we created in the Express app
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
