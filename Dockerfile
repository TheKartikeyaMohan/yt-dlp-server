FROM node:18

# Install yt-dlp and ffmpeg
RUN apt-get update && apt-get install -y python3-pip ffmpeg \
    && pip3 install yt-dlp

# Create app directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Start the app
CMD ["npm", "start"]

