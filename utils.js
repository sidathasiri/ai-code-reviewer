export const parseFeedback = (feedbackText) => {
  const comments = [];
  const regex =
    /\*\*File\*\*: (.+)\n\*\*Line\*\*: (\d+-\d+|\d+)\n\*\*Feedback\*\*: (.+?)(?=\n\*\*File\*\*:|$)/gs;
  let match;

  while ((match = regex.exec(feedbackText))) {
    const filePath = match[1];
    const lineRange = match[2];
    const body = match[3].trim();

    // Convert line range (e.g., "10-12") to a single line number (e.g., 10)
    const startLine = parseInt(lineRange.split("-")[0]);

    comments.push({
      path: filePath, // File path
      position: startLine, // Line number (use the start of the range)
      body: `**Feedback**: ${body}`, // Feedback message
    });
  }

  return comments;
};
