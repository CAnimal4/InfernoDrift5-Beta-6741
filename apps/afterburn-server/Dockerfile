FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.json ./
COPY apps/afterburn-server ./apps/afterburn-server
COPY packages/afterburn-core ./packages/afterburn-core
COPY packages/afterburn-protocol ./packages/afterburn-protocol
RUN npm ci && npm run build:server

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/afterburn-server/dist ./apps/afterburn-server/dist
EXPOSE 8787
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://127.0.0.1:8787/health || exit 1
CMD ["node", "apps/afterburn-server/dist/apps/afterburn-server/src/index.js"]
