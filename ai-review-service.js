import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { splitTextIntoChunks } from "./utils.js";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

export const reviewCode = async (diff) => {
  // Split the diff into chunks of 15,000 characters
  const chunks = splitTextIntoChunks(diff, 15000);

  // Process all chunks concurrently
  const chunkPromises = chunks.map(async (chunk, index) => {
    console.log(
      `Processing chunk ${index + 1}/${chunks.length}, size:`,
      chunk.length
    );
    const retrieveAndGen = new RetrieveAndGenerateCommand({
      input: {
        text: `As a GitHub Pull Request code review expert, analyze the following code diff from the pull request and provide the recommendations only for improvements.
        For each issue or recommendation, specify the file path and line number(s) in the format:

        **File**: <file-path>
        **Line**: <line-number>
        **Feedback**: <your-feedback>
    
        Here is code to review from git diff:
        <>${chunk}<>
        Ensure that the line numbers are correct and the feedback is relevant to the code to put review comments on the correct lines.`,
      },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE",
        knowledgeBaseConfiguration: {
          knowledgeBaseId: "V2CLQKSHN1",
          modelArn:
            "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0",
        },
      },
    });

    try {
      const { output } = await client.send(retrieveAndGen);
      return output.text;
    } catch (error) {
      console.error(`Error processing chunk ${index + 1}:`, error);
      return ""; // Return empty string for failed chunks
    }
  });

  // Wait for all chunks to be processed
  const results = await Promise.all(chunkPromises);

  // Combine all results
  const allRecommendations = results.join("\n");
  return { text: allRecommendations };
};
