FROM node:20.19.6-alpine3.22

# Directory will be created if it doesn't exist already
WORKDIR /usr/src/bot

RUN curl -sfS https://dotenvx.sh/install.sh | sh

# Install dependencies
COPY package.json /usr/src/bot
RUN npm install

# Copy bot code
COPY . /usr/src/bot

# Run the bot!
CMD ["npx", "dotenvx", "run", "--", "node", "src/index.js"]