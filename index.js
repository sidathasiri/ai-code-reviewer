import * as core from "@actions/core";

import { reviewCode } from "./ai-review-service.js";
import { getPullRequestDiff, postFileLevelComments } from "./github-service.js";

async function run() {
  try {
    const diff = await getPullRequestDiff();
    const reviewFeedback = await reviewCode(diff);
    await postFileLevelComments(reviewFeedback);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run().then();
