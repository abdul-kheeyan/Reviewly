import { logger } from "../utils/logger.js";

/**
 * Sends a PR's diff to GitHub Copilot / Azure OpenAI for review and returns
 * ranked suggestions. This is currently a deterministic mock so the rest of
 * the app (storage, routes, feedback loop) can be built and tested end to end.
 *
 * TODO: replace the mock block with a real call, e.g.:
 *   const res = await fetch(
 *     `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/<deployment>/chat/completions?api-version=2024-05-01-preview`,
 *     { method: "POST", headers: { "api-key": process.env.AZURE_OPENAI_KEY, "Content-Type": "application/json" },
 *       body: JSON.stringify({ messages: buildReviewPrompt(hunks) }) }
 *   );
 *
 * @param {{ filePath: string, patch: string }[]} hunks
 * @returns {Promise<Array<{filePath:string, line:number, severity:string, message:string, suggestedFix?:string}>>}
 */
export async function reviewDiff(hunks) {
  logger.info({ fileCount: hunks.length }, "Requesting AI review for diff");

  const suggestions = [];

  for (const hunk of hunks) {
    if (/==\s*["']/.test(hunk.patch) || /=\s*["']/.test(hunk.patch)) {
      suggestions.push({
        filePath: hunk.filePath,
        line: 1,
        severity: "warning",
        message: "Possible loose equality or assignment-in-condition — consider using ===.",
        suggestedFix: "Replace `==` / bare `=` in a condition with `===`.",
      });
    }

    if (/console\.log/.test(hunk.patch)) {
      suggestions.push({
        filePath: hunk.filePath,
        line: 1,
        severity: "style",
        message: "console.log left in the diff — use the shared logger instead.",
      });
    }
  }

  return suggestions;
}
