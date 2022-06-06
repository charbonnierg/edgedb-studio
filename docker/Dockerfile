# Build context
FROM node:14-alpine as build

COPY . /project

WORKDIR /project
RUN yarn

WORKDIR /project/web
RUN yarn build

# Final image
FROM caddy:2-alpine as final

# Install envsubst
RUN apk add --no-cache gettext bash

# Copy HTML
COPY --from=build /project/web/build /www

# Copy caddyfile
COPY docker/config/Caddyfile.template /etc/caddy/Caddyfile.template
COPY docker/scripts/entrypoint /usr/bin/entrypoint
RUN chmod +x /usr/bin/entrypoint

# Execute entrypoint first
ENTRYPOINT ["/usr/bin/entrypoint"]

# Then run caddy command
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
