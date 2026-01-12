FROM node:20.19.6-alpine3.22

# Directory will be created if it doesn't exist already
WORKDIR /usr/src/bot

# Install dependencies
COPY package.json /usr/src/bot
RUN npm install

# Copy bot code
COPY . /usr/src/bot

# Run the bot!
CMD ["node", "src/index.js"]