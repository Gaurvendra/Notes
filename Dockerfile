# Java Mastery Track: build the static React app (app/), then serve it with nginx.
# Build context = repository root: the app reads project-plan/curriculum.yaml and source-notes/AUDIT.md at build time.
# No JDK is involved anywhere (decision D-023).
FROM node:22-alpine AS build
WORKDIR /repo
COPY project-plan/curriculum.yaml project-plan/curriculum.yaml
COPY source-notes/AUDIT.md source-notes/AUDIT.md
COPY app/package.json app/package-lock.json app/
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN cd app && npm ci --no-audit --no-fund
COPY app/ app/
RUN cd app && npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/app/dist/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
