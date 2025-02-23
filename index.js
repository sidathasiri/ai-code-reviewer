import * as core from "@actions/core";

import { reviewCode } from "./ai-review-service.js";
import {
  getPullRequestDiff,
  postAIFeedbackComments,
} from "./github-service.js";

async function run() {
  try {
    const diff = await getPullRequestDiff();
    const reviewFeedback = await reviewCode(diff);
    await postAIFeedbackComments(reviewFeedback, diff);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run().then();
