import { RECORD_KINDS } from "./schema.mjs";

const KEYWORDS = {
  incident: ["outage", "exploit", "failed", "breach", "stalled", "drift", "incident", "rollback"],
  delivery: ["delivered", "handover", "installation", "shipped", "accepted", "signed off", "completed"],
  milestone: ["milestone", "launched", "published", "released", "approved", "landed"],
  commitment: ["will", "promise", "commit", "by", "deadline", "pledge"],
  request: ["need", "request", "please", "ask", "seeking", "approve"],
  observation: ["observed", "noted", "saw", "measured", "reported", "checked"]
};

export function inferKind(intake) {
  if (intake.categoryHint) {
    return intake.categoryHint;
  }

  const haystack = `${intake.title} ${intake.statement}`.toLowerCase();

  for (const kind of RECORD_KINDS) {
    const words = KEYWORDS[kind] || [];
    if (words.some((word) => haystack.includes(word))) {
      return kind;
    }
  }

  return "observation";
}

export function inferUrgency(intake, kind) {
  const haystack = `${intake.title} ${intake.statement}`.toLowerCase();

  if (kind === "incident") {
    return "high";
  }

  if (haystack.includes("urgent") || haystack.includes("blocked") || haystack.includes("today")) {
    return "high";
  }

  if (kind === "request") {
    return "normal";
  }

  return "normal";
}

export function deriveTags(intake, kind) {
  const tags = new Set([kind, ...intake.tags.map((item) => item.toLowerCase())]);
  const haystack = `${intake.title} ${intake.statement}`.toLowerCase();

  if (haystack.includes("sign off") || haystack.includes("signed off")) {
    tags.add("signed-off");
  }

  if (haystack.includes("incident") || haystack.includes("outage")) {
    tags.add("response");
  }

  if (intake.evidenceLinks.length > 0) {
    tags.add("evidence-linked");
  }

  return Array.from(tags).slice(0, 8);
}

export function buildFallbackSummary(intake, kind) {
  const base = intake.title.trim();
  const cleaned = base.endsWith(".") ? base.slice(0, -1) : base;

  if (cleaned.length <= 90) {
    return cleaned;
  }

  return `${kind[0].toUpperCase()}${kind.slice(1)} recorded: ${cleaned.slice(0, 72)}...`;
}

export function buildReason(kind, intake) {
  if (kind === "incident") {
    return "The note describes active failure conditions or operational risk and should be treated as an incident record.";
  }

  if (kind === "delivery") {
    return "The note describes a completed handover or implementation event with concrete evidence and recipient context.";
  }

  if (kind === "milestone") {
    return "The note describes a meaningful completed checkpoint rather than an observation or future promise.";
  }

  if (kind === "commitment") {
    return "The note is forward-looking and records an obligation or promised future action.";
  }

  if (kind === "request") {
    return "The note is primarily asking for approval, action, or support.";
  }

  return `The note is best represented as an observational record for ${intake.project || "the project"}.`;
}

