FROM debian:bullseye-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && pip3 install -U yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy your server code into the image
WORKDIR /app
COPY . .

# Install Node.js and dependencies
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install

# Expose port
EXPOSE 10000

# Run the Node.js app
CMD ["node", "index.js"]
