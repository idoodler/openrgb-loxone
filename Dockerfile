# Use latest node
FROM node:latest

LABEL authors="idoodler <me@idoodler.de>"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Set the node env (we only need production dependencies in the deployed image)
ENV NODE_ENV production

# Install dependencies (we deliberately just copy packages.json so we can use the cache if no package.json changes are made)
COPY package.json /usr/src/app/
RUN npm install

# Copy the sources
COPY . /usr/src/app

# Set default env
ENV PORT=
ENV OPEN_RGB_HOST=
ENV OPEN_RGB_PORT=

EXPOSE ${PORT}

# Start the REST interface!
CMD node ./index.js --listening-port ${PORT} --open-rgb-host ${OPEN_RGB_HOST} --open-rgb-port ${OPEN_RGB_PORT}
