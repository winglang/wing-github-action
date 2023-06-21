FROM node:18-slim
LABEL org.opencontainers.image.source=https://github.com/winglang/wing-github-action
LABEL org.opencontainers.image.description="Deploy Wing Apps with Github Actions"
LABEL org.opencontainers.image.licenses=MIT

RUN apt-get update -y && apt-get install -y unzip curl

ENV TF_PLUGIN_CACHE_DIR="/root/.terraform.d/plugin-cache"
ENV TERRAFORM_VERSION="1.5.0"

RUN mkdir -p ${TF_PLUGIN_CACHE_DIR}

# Install Terraform
RUN curl -LOk https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  mkdir -p /usr/local/bin/tf/versions/${TERRAFORM_VERSION} && \
  unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/local/bin/tf/versions/${TERRAFORM_VERSION} && \
  ln -s /usr/local/bin/tf/versions/${TERRAFORM_VERSION}/terraform /usr/local/bin/terraform

COPY . .

RUN npm ci && npm run build && npm run package

ENTRYPOINT ["node", "/dist/index.js"]