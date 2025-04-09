# Use official Node.js image
FROM node:20-slim

# Install dependencies: Python3, pip, ffmpeg, curl
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
 && pip3 install -U yt-dlp \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy all app files
COPY . .

# Expose the port used in your index.js
EXPOSE 5050

# Start the app
CMD ["npm", "start"]
