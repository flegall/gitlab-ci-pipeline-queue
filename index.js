#!/usr/bin/env node
var request = require("request");

const { CI_PROJECT_URL, CI_PIPELINE_ID, GITLAB_API_TOKEN } = process.env;

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
    if (pipelines.length <= 1) {
      console.log("No other pipelines in queue, ready to build !");
      process.exit(0);
    } else {
      const pipelineIds = pipelines.map(pipeline => pipeline.id);
      const lowestPipelineId = Math.min(...pipelineIds);
      const currentPipelineId = parseInt(CI_PIPELINE_ID, 10);
      if (lowestPipelineId === currentPipelineId) {
        console.log("The current pipeline is the oldest one, ready to build !");
        process.exit(0);
      } else {
        console.log(
          "The current pipeline is not the oldest one, let's wait for 5 seconds and retry"
        );
        console.log("all pipelines", pipelineIds);
        console.log("current pipeline", currentPipelineId);
        console.log("lowest pipeline", lowestPipelineId);
        setTimeout(() => {
          pollPipelines();
        }, 5000);
      }
    }
  });
}

pollPipelines();
