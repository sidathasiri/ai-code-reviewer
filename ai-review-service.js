import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

const code = `const data = await fetchData()`;

export const reviewCode = async () => {
  const retrieveAndGen = await new RetrieveAndGenerateCommand({
    input: {
      text: `As a JavaScript/TypeScript code review expert, please analyze this code for:
  1. Security vulnerabilities (especially around sensitive data handling)
  2. Best practices violations
  3. Performance considerations
  4. Error handling improvements
  5. Code readability and maintainability
  6. Code styling and formatting
  7. Code standards
  
  Code to review:
  <>${code}<>
  
  Please structure your recommendations in bullet points without any additional information. If there are no recommendations, just say no issues found.`,
    },
    retrieveAndGenerateConfiguration: {
      type: "KNOWLEDGE_BASE",
      knowledgeBaseConfiguration: {
        knowledgeBaseId: "UZFY9J150F",
        modelArn:
          "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0",
      },
    },
  });

  const { citations, output } = await client.send(retrieveAndGen);
  // console.log("🚀 ~ citations:", JSON.stringify(citations, null, 2));
  // console.log("🚀 ~ output:", JSON.stringify(output, null, 2));
  console.log(output);
};
