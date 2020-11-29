ARG NODE_VERSION=""
FROM node:${NODE_VERSION:+${NODE_VERSION}}

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN yarn install

COPY . /usr/src/app/

EXPOSE ${EXPRESS_PORT}

CMD ["yarn", "dev"]
