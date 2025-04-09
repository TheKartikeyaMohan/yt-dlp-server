# Use full Debian-based Node image for better package support
FROM node:20-bullseye

# Prevents interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies and yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl && \
    pip3 install -U yt-dlp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the remaining app source
COPY . .

# Expose app port
EXPOSE 5050

# Start the server
CMD ["npm", "start"]
