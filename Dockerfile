# Java Mastery Track website: build the static site, then serve it with nginx.
# Build context = repository root (the site reads ../project-plan and ../java-track at build time).
FROM node:22-alpine AS build
WORKDIR /repo
COPY project-plan/ project-plan/
COPY java-track/ java-track/
COPY source-notes/AUDIT.md source-notes/AUDIT.md
COPY website/package.json website/package-lock.json website/
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN cd website && npm ci
COPY website/ website/
RUN cd website && npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/website/dist/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
