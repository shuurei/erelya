FROM node:26-alpine AS builder

WORKDIR /bot

COPY package.json tsconfig.json tsup.config.ts ./

RUN apk add git tzdata && npm install

COPY .git ./.git
COPY src ./src

RUN --mount=target=/git-context \
    npx tsup \
        --env.BUILD_VERSION="$(TZ=UTC date +%y.%m.%d)" \
        --env.BUILD_NUMBER="$(TZ=UTC date +%H%M%S)" \
        --env.GIT_COMMIT="$(git -C /git-context rev-parse --short HEAD)" \
    && npx tsc-alias

COPY src/ui/assets/fonts ./build/ui/assets/fonts

FROM node:26-alpine

WORKDIR /bot

COPY --from=builder /bot/node_modules ./node_modules
COPY --from=builder /bot/package.json ./
COPY --from=builder /bot/build ./src

CMD ["node", "src/index.js"]