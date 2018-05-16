#!/usr/bin/env node
var request = require("request");

const { CI_PROJECT_URL, CI_PIPELINE_ID, GITLAB_API_TOKEN } = process.env;

console.log({ CI_PROJECT_URL, CI_PIPELINE_ID, GITLAB_API_TOKEN });

var options = {
  method: "GET",
  url: `${CI_PROJECT_URL}/pipelines.json`,
  qs: {
    scope: "running",
    page: "1",
    private_token: GITLAB_API_TOKEN
  },
  headers: {
    "Cache-Control": "no-cache"
  }
};

function pollPipelines() {
  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    const bodyParsed = JSON.parse(body);
    const { pipelines } = bodyParsed;
    console.log(bodyParsed);
    if (pipelines.length <= 1) {
      console.log("No pipelines in queue, ready to build !");
      process.exit(0);
    } else {
      const pipelineIds = pipelines.map(pipeline => pipeline.id);
      const lowestPipelineId = Math.min(...pipelineIds);
      if (lowestPipelineId === CI_PIPELINE_ID) {
        console.log("The current pipeline is the oldest one !");
        process.exit(0);
      } else {
        console.log(
          "The current pipeline is not the oldest one, let's wait 2 seconds and retry"
        );
        setTimeout(() => {
          pollPipelines();
        }, 2000);
      }
    }
  });
}

pollPipelines();
