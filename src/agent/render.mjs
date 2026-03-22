export function renderBriefing(draft) {
  return `# ${draft.title}

## Classification

- Kind: ${draft.decision.kind}
- Urgency: ${draft.decision.urgency}
- Disclosure mode: ${draft.decision.disclosure}
- Inference path: ${draft.inferencePath}

## Public Summary

${draft.summary}

## Hashes

- Content hash: \`${draft.hashes.contentHash}\`
- Context hash: \`${draft.hashes.contextHash}\`

## Tags

${draft.derivedTags.map((tag) => `- ${tag}`).join("\n")}

## Contract Call

\`${draft.contractCall.function}(${draft.contractCall.args.join(", ")})\`
`;
}
