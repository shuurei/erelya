FROM node:26-alpine AS builder

WORKDIR /bot

COPY package.json tsconfig.json tsup.config.ts ./

RUN npm install

COPY src ./src

RUN npx tsup && npx tsc-alias
COPY src/ui/assets/fonts ./build/ui/assets/fonts

FROM node:26-alpine

WORKDIR /bot

COPY --from=builder /bot/node_modules ./node_modules
COPY --from=builder /bot/package.json ./
COPY --from=builder /bot/build ./src

CMD ["node", "src/index.js"]