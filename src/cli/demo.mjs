import fs from "node:fs/promises";
import path from "node:path";
import { buildNotaryDraft } from "../agent/notary-agent.mjs";
import { renderBriefing } from "../agent/render.mjs";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    throw new Error("Usage: node src/cli/demo.mjs <intake.json>");
  }

  const raw = await fs.readFile(filePath, "utf8");
  const intake = JSON.parse(raw);
  const draft = await buildNotaryDraft(intake);
  const slug = slugify(draft.title);
  const outputDir = path.join("output", slug);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "draft.json"), JSON.stringify(draft, null, 2));
  await fs.writeFile(path.join(outputDir, "briefing.md"), renderBriefing(draft));

  process.stdout.write(
    JSON.stringify(
      {
        outputDir,
        draftPath: path.join(outputDir, "draft.json"),
        briefingPath: path.join(outputDir, "briefing.md")
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

