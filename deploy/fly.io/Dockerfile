# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20

# base node image
FROM node:${NODE_VERSION}-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable pnpm

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /myapp
WORKDIR /myapp

ADD package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Setup production node_modules
FROM base as production-deps

RUN mkdir /myapp
WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build the app
FROM base AS build

RUN mkdir /myapp
WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD prisma .
RUN pnpx prisma generate

ADD . .
RUN pnpm run build


# Finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV production

RUN mkdir /myapp
WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/prisma /myapp/prisma
COPY --from=build /myapp/dist /myapp/dist
ADD . .

CMD [ "node", "dist/main" ]