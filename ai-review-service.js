import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

export const reviewCode = async (diff) => {
  console.log("🚀 ~ diff:", diff);
  const retrieveAndGen = await new RetrieveAndGenerateCommand({
    input: {
      text: `As a JavaScript/TypeScript GitHub Pull Request code review expert, please analyze this code for:
  1. Security vulnerabilities (especially around sensitive data handling)
  2. Best practices violations
  3. Performance considerations
  4. Error handling improvements
  5. Code readability and maintainability
  6. Code styling and formatting
  7. Code standards
  
  Here is code to review from git diff:
  <>${diff}<>
  
  Please structure your recommendations in bullet points without any additional information. If there are no recommendations, just say no issues found.`,
    },
    retrieveAndGenerateConfiguration: {
      type: "KNOWLEDGE_BASE",
      knowledgeBaseConfiguration: {
        knowledgeBaseId: "YXLPYEUEFA",
        modelArn:
          "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0",
      },
    },
  });

  const { citations, output } = await client.send(retrieveAndGen);
  console.log("citations:", citations);
  return output;
};
