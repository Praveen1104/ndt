# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# --- Run Stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5200

# Copy node modules and package configs from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./

RUN mkdir -p static

EXPOSE 5200
CMD ["node", "server.js"]
