#Production Dockerfile
FROM node:21-alpine3.18 as builder

# stage 1 
WORKDIR /app 
COPY package.json ./
COPY tsconfig.json ./
COPY .npmrc ./
COPY src ./src
COPY tools ./tools
RUN npm install -g npm@latest
RUN npm ci && npm run build

# stage 2 
# apk is the package manager for Alpine Linux (which is the base of the node:21-alpine3.18 image)
# --no-cache tells APK not to store the downloaded package cache, which helps keep the image size smaller
# This command installs the curl utility, which is a tool for transferring data using various protocols (HTTP, HTTPS, FTP, etc.)
FROM node:21-alpine3.18
WORKDIR /app
RUN apk add --no-cache curl
COPY package.json ./
COPY tsconfig.json ./
COPY .npmrc ./
RUN npm install -g pm2 npm@latest
RUN npm ci --production
#Dont need to build again as we already built in stage 1
COPY --from=builder /app/build ./build 

EXPOSE 4001

CMD ["npm", "run", "start"]
