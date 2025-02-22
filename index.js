import * as core from "@actions/core";
import * as github from "@actions/github";

function run() {
  try {
    // Get input from the workflow file (if any)
    const nameToGreet = core.getInput("who-to-greet");
    console.log(`Hello, ${nameToGreet || "World"}!`);

    // Set an output for the action
    core.setOutput("greeting", `Hello, ${nameToGreet || "World"}!`);

    // Log the context (optional)
    console.log(JSON.stringify(github.context, null, 2));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
