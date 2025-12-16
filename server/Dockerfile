FROM node:18-alpine

WORKDIR /app

# Install production dependencies for the server
COPY server/package*.json ./
RUN npm install --production

# Copy server sources
COPY server ./server

EXPOSE 4000

CMD ["node", "server/index.js"]

