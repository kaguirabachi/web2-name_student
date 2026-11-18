FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init openssl netcat-openbsd

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node prisma.config.ts ./

###################
# DEVELOPMENT
###################
FROM base AS development

RUN npm ci --include=dev && npx prisma generate

COPY --chown=node:node . .

USER node
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

###################
# BUILD
###################
FROM base AS build

RUN npm ci && npx prisma generate

COPY --chown=node:node . .

RUN npm run build

###################
# PRODUCTION
###################
FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache dumb-init openssl

# node_modules keeps the Prisma CLI on purpose: the entrypoint applies pending
# migrations before the API starts.
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/prisma ./prisma
COPY --chown=node:node --from=build /app/prisma.config.ts ./
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && chown -R node:node /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
