import * as github from "@actions/github";
import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { parseAIFeedback } from "./utils.js";
import { parsePatch } from "diff";

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

async function getDiffMap(diff) {
  // Parse the diff to create a mapping of old to new line numbers
  const parsedDiff = parsePatch(diff);
  const lineMapping = new Map();

  for (const file of parsedDiff) {
    const filename = file.newFileName;
    lineMapping.set(filename, new Map());

    let newLineNumber = 0;
    let diffLineNumber = 0;

    for (const hunk of file.hunks) {
      newLineNumber = hunk.newStart;

      for (const line of hunk.lines) {
        if (line[0] === " " || line[0] === "+") {
          // Map the diff line number to the actual file line number
          lineMapping.get(filename).set(diffLineNumber, newLineNumber);
          newLineNumber++;
        }
        if (line[0] !== "-") {
          diffLineNumber++;
        }
      }
    }
  }

  return lineMapping;
}

export async function postAIFeedbackComments(feedback, diff) {
  const octokit = new github.getOctokit(process.env.GITHUB_TOKEN);
  const { owner, repo } = github.context.repo;
  const pull_number = github.context.payload.pull_request.number;

  // Get PR files
  const { data: prFiles } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  // Get the line number mapping from diff
  const lineMapping = await getDiffMap(diff);

  // Parse the AI feedback
  const parsedFeedbacks = parseAIFeedback(feedback.text);

  // Create a review with all comments
  const reviewComments = [];

  for (const feedback of parsedFeedbacks) {
    try {
      const prFile = prFiles.find((f) => f.filename === feedback.file);

      if (!prFile) {
        console.warn(`File ${feedback.file} not found in PR`);
        continue;
      }

      // Get the correct line number from our mapping
      const fileMapping = lineMapping.get(feedback.file);
      const mappedLine = fileMapping
        ? fileMapping.get(feedback.line) || feedback.line
        : feedback.line;

      reviewComments.push({
        path: feedback.file,
        body: feedback.feedback,
        line: mappedLine,
        side: "RIGHT",
      });

      console.log(
        `Mapped line ${feedback.line} to ${mappedLine} for ${feedback.file}`
      );
    } catch (error) {
      console.error(`Error processing feedback for ${feedback.file}:`, error);
    }
  }

  // Post all comments as a single review
  if (reviewComments.length > 0) {
    try {
      await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number,
        commit_id: github.context.payload.pull_request.head.sha,
        event: "COMMENT",
        comments: reviewComments,
      });
      console.log(`Posted ${reviewComments.length} review comments`);
    } catch (error) {
      console.error("Error posting review:", error);
    }
  }
}
