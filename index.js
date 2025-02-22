import * as core from "@actions/core";

import { reviewCode } from "./ai-review-service.js";
import {
  getPullRequestDiff,
  postPullRequestComment,
} from "./github-service.js";

async function run() {
  try {
    const diff = await getPullRequestDiff();
    const reviewFeedback = await reviewCode(diff);
    await postPullRequestComment(reviewFeedback);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run().then();
