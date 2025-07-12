# Use Node.js 22 Alpine for smaller image size
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Clean up devDependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S remix -u 1001

# Set correct permissions
RUN chown -R remix:nodejs /app
USER remix

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]