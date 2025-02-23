export const parseFeedback = (feedbackText) => {
  const comments = [];
  const regex =
    /\*\*File\*\*: (.+)\n\*\*Feedback\*\*: (.+?)(?=\n\*\*File\*\*:|$)/gs;
  let match;

  while ((match = regex.exec(feedbackText))) {
    const filePath = match[1];
    const body = match[2].trim();

    comments.push({
      path: filePath, // File path
      body: `**Feedback**: ${body}`, // Feedback message
    });
  }

  return comments;
};
