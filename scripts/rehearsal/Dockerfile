FROM ubuntu:22.04
ARG NODE_VERSION=24.21.0
ARG NPM_VERSION=11.19.0
ARG PM2_VERSION=6.0.8
ENV DEBIAN_FRONTEND=noninteractive TZ=UTC
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl xz-utils nginx openssh-server \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSLO https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-arm64.tar.xz \
    && curl -fsSLO https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt \
    && grep " node-v${NODE_VERSION}-linux-arm64.tar.xz$" SHASUMS256.txt | sha256sum -c - \
    && tar -xJf node-v${NODE_VERSION}-linux-arm64.tar.xz --strip-components=1 -C /usr/local \
    && rm node-v${NODE_VERSION}-linux-arm64.tar.xz SHASUMS256.txt \
    && npm install --global npm@${NPM_VERSION} pm2@${PM2_VERSION}
RUN useradd --create-home --shell /bin/bash ssh_finanzatech \
    && mkdir -p /run/sshd /opt/finanzatech /opt/rehearsal
COPY entry.mjs guard.mjs /opt/rehearsal/
COPY nginx.conf /etc/nginx/sites-available/default
COPY sshd_config /etc/ssh/sshd_config
WORKDIR /opt/finanzatech/ft-app-backend
ENTRYPOINT ["node", "/opt/rehearsal/entry.mjs"]
