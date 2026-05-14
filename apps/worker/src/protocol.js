export const QUICK_CHAT = new Set([
  "Nice drift!",
  "Defending",
  "Need boost",
  "Centering",
  "Good run!",
  "Again?",
]);

const BAD_WORDS = /\b(?:damn|hell|shit|fuck|bitch|asshole)\b/gi;
const ALLOWED_TYPES = new Set([
  "hello",
  "ping",
  "auth.guest",
  "room.create",
  "room.join",
  "room.leave",
  "queue.join",
  "queue.cancel",
  "chat.send",
  "quick.send",
  "input.frame",
  "leaderboard.get",
  "friend.request",
  "friend.list",
]);

export function sanitizeChat(input) {
  return String(input ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(BAD_WORDS, "boost")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function validateClientMessage(raw) {
  let data;
  try {
    data = typeof raw === "string" ? JSON.parse(raw) : JSON.parse(String(raw));
  } catch {
    return { ok: false, error: "invalid_json" };
  }
  if (!data || typeof data !== "object" || typeof data.type !== "string") {
    return { ok: false, error: "invalid_shape" };
  }
  if (!ALLOWED_TYPES.has(data.type)) {
    return { ok: false, error: "unknown_type" };
  }
  const encodedSize = new TextEncoder().encode(JSON.stringify(data)).byteLength;
  if (encodedSize > 2048) {
    return { ok: false, error: "message_too_large" };
  }
  if (data.type === "input.frame") {
    const speed = Math.abs(Number(data.speed ?? 0));
    if (!Number.isFinite(speed) || speed > 420) {
      return { ok: false, error: "speed_rejected" };
    }
    if (data.score || data.goal || data.devWin || data.admin) {
      return { ok: false, error: "authoritative_rejected" };
    }
  }
  if (data.type === "queue.join" && data.ranked && data.devMode) {
    return { ok: false, error: "ranked_dev_rejected" };
  }
  return { ok: true, data };
}

export function makePrivateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function normalizeRoomSize(value) {
  const size = Number(value);
  return [2, 4, 6].includes(size) ? size : 6;
}
