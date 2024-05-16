# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.10.0

# base node image
FROM node:${NODE_VERSION}-bookworm-slim as base

# fly.io specific
LABEL fly_launch_runtime="Node.js"

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json pnpm-lock.yaml .npmrc ./
RUN corepack enable
RUN pnpm install

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json pnpm-lock.yaml .npmrc ./
RUN npm prune --omit=dev

# # Node.js app lives here
# WORKDIR /app
# RUN npm install turbo --global
# RUN npm install puppeteer --global
# COPY . .
# RUN turbo prune --scope=nouvelles-cron --docker

# # remove all empty node_modules folder structure
# RUN find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
# # remove apps/nouvelles folder
# RUN rm -rf apps/nouvelles

# # Add lockfile and package.json's of isolated subworkspace
# FROM node:${NODE_VERSION}-alpine AS installer

# RUN apk add --no-cache libc6-compat
# RUN apk update
# RUN corepack enable

# WORKDIR /app

# # First install dependencies (as they change less often)
# COPY .gitignore .gitignore
# COPY --from=builder /app/out/json/ .
# COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# # Install dependencies
# RUN pnpm install

# # prisma generate
# COPY --from=builder /app/out/full/packages/database/prisma/schema.prisma /app/packages/database/prisma/schema.prisma
# RUN pnpx prisma generate --schema /app/packages/database/prisma/schema.prisma

# # Build the project and its dependencies
# COPY --from=builder /app/out/full/ .
# COPY turbo.json turbo.json
# RUN pnpm run db:generate
# RUN pnpm turbo run build --filter=nouvelles-cron...

# FROM node:${NODE_VERSION}-alpine AS runner

# RUN corepack enable

# WORKDIR /app

# # Don't run production as root
# RUN addgroup --system --gid 1001 cronfastify
# RUN adduser --system --uid 1001 cronfastify
# USER cronfastify

# # Set production environment
# ENV NODE_ENV="production"

# COPY --from=installer /app .

# CMD node apps/nouvelles-cron/dist/main