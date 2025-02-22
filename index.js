import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";
import { reviewCode } from "./ai-review-service.js";

async function run() {
  try {
    // Access the GitHub context
    const context = github.context;

    // Ensure the event is a pull request
    if (context.eventName !== "pull_request") {
      core.setFailed("This action only works for pull requests.");
      return;
    }

    // Get the PR details
    const pr = context.payload.pull_request;
    const baseSha = pr.base.sha; // Base commit (target branch)
    const headSha = pr.head.sha; // Head commit (PR branch)

    // Get the list of changed files using Git
    let changedFiles = "";
    await exec.exec("git", ["diff", "--name-only", `${baseSha}..${headSha}`], {
      listeners: {
        stdout: (data) => {
          changedFiles += data.toString();
        },
      },
    });

    const files = changedFiles.split("\n").filter(Boolean);
    // console.log("Changed Files:", files);

    // Get the diff for each file
    let diffOutput = "";
    await exec.exec("git", ["diff", `${baseSha}..${headSha}`], {
      listeners: {
        stdout: (data) => {
          diffOutput += data.toString();
        },
      },
    });

    // console.log("Diff Output:", diffOutput);
    await reviewCode(diffOutput);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run().then();
