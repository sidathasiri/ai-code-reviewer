export const parseAIFeedback = (feedbackText) => {
  const feedbacks = [];

  // Split the text by "**File**:" to get each feedback block
  const blocks = feedbackText
    .split("**File**:")
    .filter((block) => block.trim());

  for (const block of blocks) {
    // Extract file, line, and feedback using regex
    const fileMatch = block.match(/([^*\n]+)/);
    const lineMatch = block.match(/\*\*Line\*\*:\s*(\d+)/);
    const feedbackMatch = block.match(/\*\*Feedback\*\*:\s*([^*]+)/);

    if (fileMatch && lineMatch && feedbackMatch) {
      feedbacks.push({
        file: fileMatch[1].trim(),
        line: parseInt(lineMatch[1], 10),
        feedback: feedbackMatch[1].trim(),
      });
    }
  }

  return feedbacks;
};

export function formatAIFeedbackComment(feedbackText) {
  return `### AI Code Review Feedback\n\n${feedbackText
    .split("\n")
    .map((line) => {
      if (line.startsWith("- **")) {
        return `#### ${line.slice(4, -4)}\n`; // Convert bold headers to markdown subheadings
      }
      return line;
    })
    .join("\n")}`;
}
