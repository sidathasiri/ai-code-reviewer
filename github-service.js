import * as github from "@actions/github";
import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { parseFeedback } from "./utils";

export const getPullRequestDiff = async () => {
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

  // Get the diff for each file
  let diffOutput = "";
  await exec.exec("git", ["diff", `${baseSha}..${headSha}`], {
    listeners: {
      stdout: (data) => {
        diffOutput += data.toString();
      },
    },
  });
  return diffOutput;
};

export const postPullRequestComment = async (feedback) => {
  console.log("🚀 ~ feedback:", feedback);

  const octokit = new github.getOctokit(process.env.GITHUB_TOKEN);

  // Use pull_request from the context payload
  const { owner, repo } = github.context.repo;
  const pull_number = github.context.payload.pull_request.number;

  const formattedComment = `### AI Code Review Feedback\n\n${feedback.text
    .split("\n")
    .map((line) => {
      if (line.startsWith("- **")) {
        return `#### ${line.slice(4, -4)}\n`; // Convert bold headers to markdown subheadings
      }
      return line;
    })
    .join("\n")}`;

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number, // Use the PR number from the payload
    event: "COMMENT", // Add a comment to the PR
    body: formattedComment,
  });
};

export const postLineLevelComments = async (feedback) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const { owner, repo } = github.context.repo;
  const pull_number = github.context.payload.pull_request.number;

  // Parse the feedback into line-level comments
  const comments = parseFeedback(feedback.text);

  // Post the comments on the PR
  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number,
    event: "COMMENT", // Add comments without approving or requesting changes
    comments, // Array of line-level comments
  });

  console.log("Line-level comments posted to PR.");
};
