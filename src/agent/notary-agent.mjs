import dotenv from "dotenv";
import { keccak256, stringToHex } from "viem";
import { buildFallbackSummary, buildReason, deriveTags, inferKind, inferUrgency } from "./heuristics.mjs";
import { requestModelSuggestion } from "./model-client.mjs";
import { draftSchema, intakeSchema, RECORD_KINDS } from "./schema.mjs";

dotenv.config();

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function hashObject(value) {
  return keccak256(stringToHex(stableJson(value)));
}

export async function buildNotaryDraft(rawIntake) {
  const intake = intakeSchema.parse(rawIntake);
  const fallbackKind = inferKind(intake);
  const fallbackTags = deriveTags(intake, fallbackKind);
  const fallbackUrgency = inferUrgency(intake, fallbackKind);
  const fallbackSummary = buildFallbackSummary(intake, fallbackKind);

  let modelSuggestion = null;
  try {
    modelSuggestion = await requestModelSuggestion(intake);
  } catch (error) {
    modelSuggestion = {
      _error: error instanceof Error ? error.message : "model request failed"
    };
  }

  const chosenKind = modelSuggestion?.kind || fallbackKind;
  const chosenSummary = modelSuggestion?.summary || fallbackSummary;
  const chosenTags = modelSuggestion?.derivedTags?.length ? modelSuggestion.derivedTags : fallbackTags;
  const chosenReason = modelSuggestion?.reason || buildReason(chosenKind, intake);
  const disclosure =
    modelSuggestion?.disclosure || "hash_full_source_keep_public_summary";
  const inferencePath = modelSuggestion
    ? modelSuggestion._error
      ? "heuristics_after_model_error"
      : "model"
    : "heuristics";

  const canonicalSource = {
    audience: intake.audience,
    statement: intake.statement,
    parties: intake.parties,
    evidenceLinks: intake.evidenceLinks,
    sourceRefs: intake.sourceRefs,
    happenedAt: intake.happenedAt || null
  };

  const canonicalContext = {
    authorName: intake.authorName,
    project: intake.project || null,
    team: intake.team || null,
    title: intake.title,
    tags: chosenTags,
    uri: intake.uri || null
  };

  const contentHash = hashObject(canonicalSource);
  const contextHash = hashObject(canonicalContext);
  const kindIndex = RECORD_KINDS.indexOf(chosenKind);

  const draft = {
    project: intake.project,
    title: intake.title,
    decision: {
      kind: chosenKind,
      kindIndex,
      disclosure,
      urgency: fallbackUrgency,
      reason: chosenReason
    },
    summary: chosenSummary,
    canonicalSource,
    hashes: {
      contentHash,
      contextHash
    },
    derivedTags: chosenTags,
    inferencePath,
    contractCall: {
      function: "notarize",
      args: [kindIndex, contentHash, contextHash, chosenSummary, intake.uri || ""]
    },
    _modelFallback: modelSuggestion?._error || null
  };

  return draftSchema.parse(draft);
}
