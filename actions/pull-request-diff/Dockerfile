FROM ghcr.io/winglang/wing-github-action:main
# ghcr.io/winglang/wing-github-action:main

RUN mkdir /action
COPY ./dist /action/dist
COPY ./plugins /action/plugins

ENTRYPOINT ["node", "/action/dist/index.js"]