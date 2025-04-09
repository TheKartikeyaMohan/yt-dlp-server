FROM node:18

# Install Python, pip, ffmpeg, curl, and CA certificates
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  ffmpeg \
  curl \
  ca-certificates && \
  pip3 install -U yt-dlp && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy project files
COPY . .

# Install Node dependencies
RUN npm install

# Expose port used by Express
EXPOSE 5050

# Run app
CMD ["npm", "start"]
