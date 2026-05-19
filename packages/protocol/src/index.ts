import { z } from "zod";

export const PROTOCOL_VERSION = 1;
export const MESSAGE_LIMIT_BYTES = 2048;

export const QUICK_CHAT = [
  "Nice drift!",
  "Defending",
  "Need boost",
  "Passing left",
  "Good run!",
  "Again?",
  "One more run",
  "Good save",
] as const;

export const BLOCKED_TERMS = [
  "damn",
  "hell",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "dick",
  "kys",
  "kill yourself",
  "go die",
  "white power",
] as const;

const SOFT_SWEAR_PATTERNS = [
  /\bd+a+m+n+\b/i,
  /\bh+e+l+l+\b/i,
  /\bf+u+c+k+\b/i,
  /\bs+h+i+t+\b/i,
  /\bb+i+t+c+h+\b/i,
  /\ba+s+s+h+o+l+e+\b/i,
  /\bc+u+n+t+\b/i,
  /\bd+i+c+k+\b/i,
] as const;

const SEVERE_MODERATION_PATTERNS = [
  /\bk+y+s+\b/i,
  /\b(?:kill|hurt)\s+yourself\b/i,
  /\bgo\s+die\b/i,
  /\br+a+p+e+\b/i,
  /\bp+o+r+n+\b/i,
  /\bn+u+d+e+s?\b/i,
  /\bn+i+g+g+(?:e+r+|a+)\b/i,
  /\bc+h+i+n+k+\b/i,
  /\bs+p+i+c+\b/i,
  /\bk+i+k+e+\b/i,
  /\bf+a+g+(?:g+o+t+)?\b/i,
  /\bt+r+a+n+n+y+\b/i,
  /\bd+y+k+e+\b/i,
  /\bh+o+m+o+\b/i,
  /\br+e+t+a+r+d+\b/i,
  /\bs+h+e+\s*-\s*m+a+l+e+\b/i,
  /\bn+a+z+i+\b/i,
  /\bh+i+t+l+e+r+\b/i,
  /\bh+e+i+l+\b/i,
  /\bw+h+i+t+e+\s+p+o+w+e+r+\b/i,
  /\bg+a+s+\s+(?:the\s+)?j+e+w+s+\b/i,
  /\bj+e+w+\s+(?:r+a+t+|p+i+g+|t+r+a+s+h+)\b/i,
  /\b(?:all\s+)?(?:j+e+w+s+|m+u+s+l+i+m+s+|b+l+a+c+k+s+|g+a+y+s+|t+r+a+n+s+)\s+(?:a+r+e+|r+)\s+(?:e+v+i+l+|d+i+r+t+y+|g+r+o+s+s+|i+n+f+e+r+i+o+r+)\b/i,
  /\by+o+u+\s+(?:a+r+e+|r+)\s+(?:t+r+a+s+h+|w+o+r+t+h+l+e+s+s+|u+g+l+y+)\b/i,
  /\by+o+u+\s+(?:s+u+c+k+|s+h+o+u+l+d+\s+q+u+i+t+)\b/i,
  /\bn+o+\s+o+n+e+\s+l+i+k+e+s+\s+y+o+u+\b/i,
] as const;

export const PII_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
] as const;

export function normalizeModerationText(value: unknown): string {
  const leetMap: Record<string, string> = {
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "@": "a",
    $: "s",
    "!": "i",
    "+": "t",
  };
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[013457@$!+]/g, (char) => leetMap[char] ?? char)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/([a-z])\1{2,}/g, "$1$1")
    .trim();
}

export function isSevereModerationHit(value: unknown): boolean {
  const normalized = normalizeModerationText(value);
  return SEVERE_MODERATION_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function sanitizeDisplayText(value: unknown, maxLength = 120): string {
  const raw = String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  let clean = raw;
  for (const pattern of SOFT_SWEAR_PATTERNS) {
    clean = clean.replace(new RegExp(pattern.source, "gi"), "boost");
  }
  for (const pattern of PII_PATTERNS) {
    clean = clean.replace(pattern, "[private]");
  }
  const normalizedRaw = normalizeModerationText(raw);
  const normalizedClean = normalizeModerationText(clean);
  const softBypass = SOFT_SWEAR_PATTERNS.some((pattern) =>
    pattern.test(normalizedRaw),
  );
  if (
    isSevereModerationHit(raw) ||
    (softBypass && normalizedRaw === normalizedClean)
  ) {
    return "[blocked]";
  }
  return clean;
}

export function normalizeUsername(value: unknown): string {
  const sanitized = sanitizeDisplayText(value, 20);
  if (sanitized === "[blocked]") return "";
  return sanitized.replace(/[^a-z0-9 _-]/gi, "");
}

export function isClarkFounder(username: string): boolean {
  return username === "Clark";
}

export function canUseFreeChat(age: number | null | undefined): boolean {
  return typeof age === "number" && age >= 13;
}

export const rankedPlaylistSchema = z.enum([
  "casual",
  "ranked",
  "private",
  "bot",
]);
export const teamSizeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
export const feedbackTypeSchema = z.enum(["bug", "feature", "fix", "other"]);
export const safePayloadSchema = z.record(z.string(), z.unknown()).refine(
  (payload) => {
    try {
      return JSON.stringify(payload).length <= 20000;
    } catch {
      return false;
    }
  },
  { message: "payload_too_large" },
);

export const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("auth.guest"),
    version: z.literal(PROTOCOL_VERSION).optional(),
    username: z.string().min(1).max(24),
    age: z.number().int().min(0).max(120).optional(),
    deviceId: z.string().max(96).optional(),
    sessionToken: z.string().min(8).max(128).optional(),
  }),
  z.object({
    type: z.literal("auth.account"),
    version: z.literal(PROTOCOL_VERSION).optional(),
    mode: z.enum(["auto", "create", "signin"]).default("auto"),
    username: z.string().min(2).max(24),
    password: z.string().min(6).max(128),
    age: z.number().int().min(0).max(120),
    deviceId: z.string().max(96).optional(),
    sessionToken: z.string().min(8).max(128).optional(),
    turnstileToken: z.string().max(2048).optional(),
  }),
  z.object({
    type: z.literal("profile.claimUsername"),
    username: z.string().min(1).max(24),
    turnstileToken: z.string().max(2048).optional(),
  }),
  z.object({ type: z.literal("profile.get") }),
  z.object({ type: z.literal("profile.logout") }),
  z.object({
    type: z.literal("profile.delete"),
    confirmUsername: z.string().min(1).max(24),
  }),
  z.object({
    type: z.literal("room.create"),
    playlist: rankedPlaylistSchema.default("casual"),
    teamSize: teamSizeSchema.default(3),
    botFill: z.boolean().default(true),
    private: z.boolean().default(true),
  }),
  z.object({
    type: z.literal("room.join"),
    code: z.string().min(4).max(10),
  }),
  z.object({ type: z.literal("room.leave") }),
  z.object({
    type: z.literal("queue.join"),
    playlist: rankedPlaylistSchema.default("casual"),
    teamSize: teamSizeSchema.default(3),
    botFill: z.boolean().default(true),
  }),
  z.object({ type: z.literal("queue.cancel") }),
  z.object({ type: z.literal("quick.send"), text: z.enum(QUICK_CHAT) }),
  z.object({
    type: z.literal("chat.send"),
    text: z.string().min(1).max(160),
    channel: z.enum(["lobby", "friend"]).default("lobby"),
  }),
  z.object({
    type: z.literal("friend.request"),
    username: z.string().min(1).max(24),
  }),
  z.object({
    type: z.literal("friend.accept"),
    requestId: z.string().min(1).max(80),
  }),
  z.object({
    type: z.literal("friend.block"),
    username: z.string().min(1).max(24),
  }),
  z.object({
    type: z.literal("friend.report"),
    username: z.string().min(1).max(24),
    reason: z.string().min(3).max(180),
  }),
  z.object({ type: z.literal("friend.list") }),
  z.object({
    type: z.literal("input.frame"),
    seq: z.number().int().nonnegative(),
    dt: z.number().min(0).max(0.12),
    throttle: z.number().min(-1).max(1),
    steer: z.number().min(-1).max(1),
    drift: z.boolean(),
    boost: z.boolean(),
    jump: z.boolean(),
    client: z
      .object({
        x: z.number().min(-1000).max(1000),
        z: z.number().min(-1000).max(1000),
        speed: z.number().min(-420).max(420),
      })
      .optional(),
  }),
  z.object({
    type: z.literal("results.commit"),
    mode: z.string().min(1).max(32).optional(),
    runId: z.string().min(1).max(80).optional(),
    stats: safePayloadSchema.optional(),
  }),
  z.object({
    type: z.literal("leaderboard.get"),
    playlist: rankedPlaylistSchema,
  }),
  z.object({
    type: z.literal("save.sync"),
    schemaVersion: z.number().int().min(1).max(20),
    payload: safePayloadSchema,
  }),
  z.object({
    type: z.literal("feedback.submit"),
    feedbackType: feedbackTypeSchema,
    message: z.string().min(8).max(2000),
    replyEmail: z.string().max(120).email().or(z.literal("")).optional(),
    diagnostics: safePayloadSchema.optional(),
    turnstileToken: z.string().max(2048).optional(),
  }),
  z
    .object({
      type: z.literal("moderation.kick"),
      username: z.string().min(1).max(24).optional(),
      userId: z.string().min(1).max(80).optional(),
      reason: z.string().min(1).max(180).optional(),
    })
    .refine((message) => Boolean(message.username || message.userId), {
      message: "target_required",
    }),
  z
    .object({
      type: z.literal("moderation.ban"),
      username: z.string().min(1).max(24).optional(),
      userId: z.string().min(1).max(80).optional(),
      reason: z.string().min(1).max(180).optional(),
    })
    .refine((message) => Boolean(message.username || message.userId), {
      message: "target_required",
    }),
  z.object({
    type: z.literal("reconnect"),
    sessionToken: z.string().min(8).max(128),
    roomCode: z.string().min(4).max(10).optional(),
  }),
  z.object({ type: z.literal("ping"), t: z.number() }),
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;

export function parseClientMessage(
  value: unknown,
): { ok: true; message: ClientMessage } | { ok: false; error: string } {
  const result = clientMessageSchema.safeParse(value);
  if (!result.success) return { ok: false, error: "invalid_protocol" };
  if (result.data.type === "chat.send") {
    const source =
      value && typeof value === "object" ? (value as { age?: unknown }) : {};
    const age = source.age === undefined ? undefined : Number(source.age);
    if (!canUseFreeChat(age))
      return { ok: false, error: "chat_requires_13_plus" };
  }
  if (result.data.type === "results.commit") {
    return { ok: false, error: "authoritative_rejected" };
  }
  return { ok: true, message: result.data };
}
