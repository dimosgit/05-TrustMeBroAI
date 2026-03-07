FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM base AS dev
EXPOSE 8080
CMD ["npm", "run", "dev"]

FROM base AS production
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "run", "start"]
