# Use Debian-based Node image that supports apt
FROM node:18-bullseye

# Install Python, pip, ffmpeg, curl, and SSL certs
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates && \
    pip3 install -U yt-dlp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# Install dependencies
RUN npm install

# Expose port used by Express
EXPOSE 5050

# Start server
CMD ["npm", "start"]
