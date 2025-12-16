FROM node:18-alpine

WORKDIR /app

# Install production dependencies for the server
# Copiar el package.json desde la raíz del contexto (no existe server/package.json)
COPY package*.json ./
RUN npm install --production

# Copy server sources
COPY server ./server

EXPOSE 4000

CMD ["node", "server/index.js"]
