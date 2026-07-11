import { z } from "zod";
import type { MatchEvent, MatchSnapshot, ModeId, RunResult } from "../../afterburn-core/src/index.js";

export const AFTERBURN_PROTOCOL_VERSION = 2;
export const MAX_MESSAGE_BYTES = 4096;
export const QUICK_CHAT = [
  "Nice line!",
  "Core here",
  "Need a revive",
  "Hunter behind",
  "Take the shortcut",
  "Ready to extract",
  "Rematch?",
  "Regroup on me",
  "Route left",
  "Route right",
  "Boosting now",
  "🔥 Clean drift",
  "⚠ Hunter close",
] as const;

const modeSchema = z.enum(["burn-run", "burn-crew", "heat-circuit", "drift-clash", "wreckyard"]);
const chassisSchema = z.enum(["vandal", "apex", "warden", "wraith"]);
const roomCodeSchema = z.string().regex(/^[A-Z0-9]{6}$/);

export const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("session.guest"),
    version: z.literal(AFTERBURN_PROTOCOL_VERSION),
    name: z.string().trim().min(1).max(20),
    resumeToken: z.string().min(16).max(128).optional(),
  }),
  z.object({
    type: z.literal("session.firebase"),
    version: z.literal(AFTERBURN_PROTOCOL_VERSION),
    idToken: z.string().min(32).max(4096),
    name: z.string().trim().min(1).max(20),
    resumeToken: z.string().min(16).max(128).optional(),
  }),
  z.object({
    type: z.literal("room.create"),
    mode: modeSchema.exclude(["burn-run", "wreckyard"]),
    botFill: z.boolean().default(true),
  }),
  z.object({ type: z.literal("room.join"), code: roomCodeSchema }),
  z.object({
    type: z.literal("queue.join"),
    mode: modeSchema.exclude(["burn-run", "wreckyard"]),
  }),
  z.object({ type: z.literal("room.leave") }),
  z.object({ type: z.literal("match.ready"), ready: z.boolean() }),
  z.object({ type: z.literal("match.rematch") }),
  z.object({
    type: z.literal("input.frame"),
    seq: z.number().int().min(0).max(2_000_000_000),
    throttle: z.number().min(-1).max(1),
    steer: z.number().min(-1).max(1),
    drift: z.boolean(),
    boost: z.boolean(),
    jump: z.boolean(),
    recover: z.boolean(),
  }).strict(),
  z.object({ type: z.literal("quick.send"), text: z.enum(QUICK_CHAT) }),
  z.object({ type: z.literal("chassis.select"), chassis: chassisSchema }),
  z.object({ type: z.literal("ping"), sentAt: z.number() }),
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;

export interface RoomPlayer {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
  bot: boolean;
  chassis: "vandal" | "apex" | "warden" | "wraith";
}

export interface RoomSnapshot {
  code: string;
  mode: Exclude<ModeId, "burn-run" | "wreckyard">;
  phase: "lobby" | "countdown" | "running" | "finished";
  players: RoomPlayer[];
  botFill: boolean;
  hostId: string;
  seed: number;
}

export type ServerMessage =
  | {
      type: "hello";
      version: 2;
      region: string;
      serverTime: number;
    }
  | {
      type: "session.accepted";
      playerId: string;
      sessionToken: string;
      resumed: boolean;
    }
  | { type: "room.snapshot"; room: RoomSnapshot }
  | { type: "match.started"; roomCode: string; seed: number; playerId: string }
  | { type: "match.snapshot"; snapshot: MatchSnapshot; ack: number }
  | { type: "match.events"; events: MatchEvent[] }
  | { type: "match.result"; result: RunResult; verified: true }
  | { type: "quick.message"; playerId: string; name: string; text: (typeof QUICK_CHAT)[number] }
  | { type: "pong"; sentAt: number; serverTime: number }
  | { type: "error"; code: string; recoverable: boolean };

export function parseClientMessage(raw: unknown):
  | { ok: true; value: ClientMessage }
  | { ok: false; error: string } {
  let value: unknown = raw;
  if (typeof raw === "string" || raw instanceof Uint8Array) {
    const text = typeof raw === "string" ? raw : new TextDecoder().decode(raw);
    if (new TextEncoder().encode(text).byteLength > MAX_MESSAGE_BYTES) {
      return { ok: false, error: "message_too_large" };
    }
    try {
      value = JSON.parse(text);
    } catch {
      return { ok: false, error: "invalid_json" };
    }
  }
  const result = clientMessageSchema.safeParse(value);
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, error: "invalid_protocol" };
}

export function encodeServerMessage(message: ServerMessage): string {
  return JSON.stringify(message);
}
