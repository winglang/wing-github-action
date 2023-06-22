<p align="center">
  <a href="https://github.com/winglang/wing-github-action/actions"><img alt="wing-github-action status" src="https://github.com/winglang/wing-github-action/workflows/build-test/badge.svg"></a>
</p>

# Winglang Github Actions

*Note:* This is an alpha version! Interface is likely to change. Recommended usage for testing purposes only.

## Deploy

Find the action for deploying here [./actions/deploy](./actions/deploy/)

## Pull Request Diff

Find the action for creating diffs on PRs here [./actions/pull-request-diff](./actions/pull-request-diff/)


## Roadmap

- [x] Deploy action
- [ ] Unit tests
- [ ] Extract common utils into shared package
- [x] Pull Request plan action which posts the plan against `main` as a comment on the PR
- [x] Build base image which includes Terraform. The action itself should use the default on demand build since it simplifies the versioning quite a bit
- [ ] Wing Backend (once implemented)
- [ ] Generate Wing architecture diagram and post to PR
- [ ] AWS CDK support (not sure if that's already working)
- [ ] Pull Request ephemeral deploy action