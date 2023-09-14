<p align="center">
  <a href="https://github.com/winglang/wing-github-action/actions"><img alt="wing-github-action status" src="https://github.com/winglang/wing-github-action/workflows/build-test/badge.svg"></a>
</p>

# Winglang Deployment Github Action

*Note:* This is an alpha version! Interface is likely to change. Recommended usage for testing purposes only.

The 'Winglang Deployment Github Action' is a powerful tool that allows you to seamlessly deploy your Winglang code to a cloud target of your choice directly from your GitHub workflows.

## Usage

To use the 'Winglang Deployment Github Action' in your workflow, add the following step:

```yaml
steps:
  - name: Deploy Winglang App
    uses: winglang/wing-github-action/actions/deploy@main
    with:
      entry: 'main.wing' # Required, replace this with your entry file if different
      target: 'tf-aws' # Required, the target to deploy to. e.g. tf-aws, tf-gcp, tf-azure or awscdk.
      version: 'latest' # Optional, specify a different version of the Winglang CLI if required
      working-directory: '' # Optional, the working directory to use. e.g. ./examples/with-dependencies. Will set backend-scope to the relative path of the working directory.
      backend: 's3' # Optional, currently only 's3' is supported
      backendScope: '' # Optional, allows setting a postfix to the generated state file name. Useful if multiple wing apps are deployed from the same repo
    env:
      TF_BACKEND_BUCKET: '<your-bucket-name>' # required, only required if s3 backend is
      TF_BACKEND_BUCKET_REGION: '<your-bucket-region>' #  required, only required if s3 backend is
```

A minimal working config for [AWS with OIDC](https://github.com/aws-actions/configure-aws-credentials) could look like this and deploy a `main.w` Wing application.

```yaml
on: [pull_request]

permissions:
  id-token: write      # required for requesting the JWT
  contents: read       # required for checkout

env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  TF_BACKEND_BUCKET: ${{ secrets.TF_BACKEND_BUCKET }}
  TF_BACKEND_BUCKET_REGION: ${{ secrets.AWS_REGION }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          role-session-name: gh-actions-winglang
          aws-region: ${{ env.AWS_REGION }}
      - name: Terraform Deploy
        uses: winglang/wing-github-action/actions/deploy@0.1.0
        with:
          entry: main.w
          target: 'tf-aws'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Example of OIDC IAM role trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::11111111111:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": [
              "repo:OWNER/REPO:pull_request",
              "repo:OWNER/REPO:ref:refs/heads/main"
          ]
        }
      }
    }
  ]
}
```


### Environment Variables

- `TF_BACKEND_BUCKET`: The name of your S3 bucket used for the Terraform backend.
- `TF_BACKEND_BUCKET_REGION`: The region of your S3 bucket.
- `AWS_ACCESS_KEY_ID`: The AWS Access Key ID for your account.
- `AWS_SECRET_ACCESS_KEY`: The AWS Secret Access Key for your account.

**Note:** If you're using the `s3` backend, the `TF_BACKEND_BUCKET` and `TF_BACKEND_BUCKET_REGION` environment variables need to be set with appropriate values. These credentials must have access to the specified S3 bucket.

For better security, it is recommended to use GitHub's OpenID Connect service with Amazon Web Services. It is a security-hardened service for getting temporary credentials. You can find more about it here: [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) and [configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials).

### Node Dependencies

This Action runs in a Docker container with Node v18.

Dependencies are automatically installed via NPM. Not yet implemented: Please make sure to add the `packageManager` field to your `package.json` file if you're using anything else than NPM.

```
{
  "packageManager": "pnpm@6.32.3"
}
```

### Terraform

This Action includes a recent version of Terraform (v1.5.0).

## Development

Setup:

- a working Docker setup
- [act](https://github.com/nektos/act) for local Action testing

```
npm install
npm run all
act -j test ./.github/workflows/test.yml -s AWS_SECRET_ACCESS_KEY=<value> -s AWS_ACCESS_KEY_ID=<value>
```