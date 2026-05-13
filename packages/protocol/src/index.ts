import { z } from "zod";

export const protocolVersion = 1;

export const modeSchema = z.enum([
  "tutorial",
  "campaign",
  "max-arena",
  "race",
  "stunt-park",
  "hunter-tag",
  "boss-chase",
  "time-trial",
  "drift-score",
  "battle-arena",
  "minigame",
]);

export const quickChatSchema = z.enum([
  "nice-shot",
  "defending",
  "need-boost",
  "incoming",
  "gg",
  "rematch",
]);

export const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("auth.resume"),
    seq: z.number().int().nonnegative(),
    payload: z.object({
      deviceId: z.string().min(4).max(96),
      username: z.string().min(2).max(18).optional(),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("queue.join"),
    seq: z.number().int().nonnegative(),
    payload: z.object({
      mode: modeSchema,
      queue: z.enum(["casual", "ranked", "bot-match"]),
      teamSize: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      skill: z.number().min(0).max(5000).default(1000),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("room.create"),
    seq: z.number().int().nonnegative(),
    payload: z.object({
      mode: modeSchema,
      private: z.boolean().default(true),
      teamSize: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("room.join"),
    seq: z.number().int().nonnegative(),
    payload: z.object({ code: z.string().min(4).max(8) }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("room.leave"),
    seq: z.number().int().nonnegative(),
    payload: z.object({}),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("input.frame"),
    seq: z.number().int().nonnegative(),
    payload: z.object({
      tick: z.number().int().nonnegative(),
      throttle: z.number().min(-1).max(1),
      steer: z.number().min(-1).max(1),
      drift: z.boolean(),
      boost: z.boolean(),
      jump: z.boolean(),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("chat.send"),
    seq: z.number().int().nonnegative(),
    payload: z.object({
      roomId: z.string().max(64).optional(),
      text: z.string().min(1).max(160),
      quick: quickChatSchema.optional(),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("friend.request"),
    seq: z.number().int().nonnegative(),
    payload: z.object({ username: z.string().min(2).max(18) }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("friend.accept"),
    seq: z.number().int().nonnegative(),
    payload: z.object({ accountId: z.string().min(4).max(64) }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("presence.set"),
    seq: z.number().int().nonnegative(),
    payload: z.object({ status: z.enum(["online", "away", "in-match"]) }),
  }),
]);

export const serverMessageSchema = z.discriminatedUnion("type", [
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("hello"),
    payload: z.object({
      serverTime: z.number(),
      features: z.array(z.string()),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("auth.ok"),
    payload: z.object({
      accountId: z.string(),
      username: z.string(),
      rating: z.number(),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("queue.state"),
    payload: z.object({
      status: z.enum(["queued", "matched", "cancelled"]),
      estimateSeconds: z.number(),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("room.snapshot"),
    payload: z.object({
      roomId: z.string(),
      code: z.string(),
      tick: z.number(),
      players: z.array(
        z.object({ id: z.string(), username: z.string(), team: z.string() }),
      ),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("room.event"),
    payload: z.object({
      roomId: z.string().optional(),
      event: z.string(),
      detail: z.string().optional(),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("input.ack"),
    payload: z.object({ seq: z.number(), tick: z.number() }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("chat.message"),
    payload: z.object({
      from: z.string(),
      text: z.string(),
      quick: quickChatSchema.optional(),
      sentAt: z.number(),
    }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("presence.update"),
    payload: z.object({ accountId: z.string(), status: z.string() }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("error"),
    payload: z.object({ code: z.string(), message: z.string() }),
  }),
  z.object({
    v: z.literal(protocolVersion),
    type: z.literal("rate_limited"),
    payload: z.object({ retryAfterMs: z.number() }),
  }),
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;
export type GameMode = z.infer<typeof modeSchema>;

export function parseClientMessage(input: unknown): ClientMessage {
  return clientMessageSchema.parse(input);
}

export function sanitizeChat(text: string): string {
  const cleaned = text
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return cleaned.replace(/\b(?:damn|hell)\b/gi, "****");
}
