# Dockerfile (Root)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite port
EXPOSE 5173

# Start Vite with host exposure
CMD ["npm", "run", "dev", "--", "--host"]
