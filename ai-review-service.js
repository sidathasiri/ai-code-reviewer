import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

export const reviewCode = async (diff) => {
  console.log("🚀 ~ diff:", diff);
  const retrieveAndGen = await new RetrieveAndGenerateCommand({
    input: {
      text: `As a GitHub Pull Request code review expert, analyze the following code diff from the pull request and provide the recommendations only for improvements.
      For each issue or recommendation, specify the file path and line number(s) in the format:

      **File**: <file-path>
      **Line**: <line-number>
      **Feedback**: <your-feedback>
  
      Here is code to review from git diff:
      <>${diff}<>`,
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

  const { citations, output } = await client.send(retrieveAndGen);
  // console.log("citations:", JSON.stringify(citations, null, 2));
  console.log("output:", output);
  return output;
};
