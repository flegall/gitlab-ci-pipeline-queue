# gitlab-ci-pipeline-queue

A simple pipeline queue tool for gitlab ci that will queue pipelines to prevent concurrent deployments.

This is a **HACKY** workaround for this issue https://gitlab.com/gitlab-org/gitlab-ce/issues/20481

It will poll gitlab's API and only return when the current pipeline should run.
It's not at all optimal as it will use runner instances for waiting and polling gitlab's API.

Use it at your own risk.

# Using it

* Create an **api** [access_token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) and provide it as a [secret variable](https://docs.gitlab.com/ee/ci/variables/) named GITLAB_API_TOKEN
* In your _.gitlab-cy.yml_ file add the following stage and job :

```yaml
stages:
  - wait for previous builds to complete

wait for previous builds to complete:
  stage: wait for previous builds to complete
  image: node:8.11.2-slim
  script:
    - yarn config set registry https://artifactory-iva.si.francetelecom.fr/artifactory/api/npm/npmproxy -g
    - yarn global add gitlab-ci-pipeline-queue@latest
    - gitlab-ci-pipeline-queue
```
