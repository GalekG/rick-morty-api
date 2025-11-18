FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --no-audit

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY .sequelizerc .sequelizerc
COPY sequelize.config.js sequelize.config.js

COPY src/infrastructure/database/migrations ./src/infrastructure/database/migrations
COPY src/infrastructure/database/seeders ./src/infrastructure/database/seeders
COPY src/infrastructure/database/models ./src/infrastructure/database/models

EXPOSE 3000

CMD npm run db:migrate && node dist/main.js