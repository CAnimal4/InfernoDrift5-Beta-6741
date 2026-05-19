export const PROTOCOL_VERSION = 1;
export const MESSAGE_LIMIT_BYTES = 2048;

export const QUICK_CHAT = new Set([
  "Nice drift!",
  "Defending",
  "Need boost",
  "Centering",
  "Good run!",
  "Again?",
  "Passing left",
  "One more run",
  "Good save",
]);

const SOFT_SWEAR_PATTERNS = [
  /\bd+a+m+n+\b/i,
  /\bh+e+l+l+\b/i,
  /\bf+u+c+k+\b/i,
  /\bs+h+i+t+\b/i,
  /\bb+i+t+c+h+\b/i,
  /\ba+s+s+h+o+l+e+\b/i,
  /\bc+u+n+t+\b/i,
  /\bd+i+c+k+\b/i,
];

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
];

const PII_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
];

const ALLOWED_TYPES = new Set([
  "ping",
  "auth.guest",
  "auth.account",
  "profile.get",
  "profile.logout",
  "profile.delete",
  "profile.claimUsername",
  "room.create",
  "room.join",
  "room.leave",
  "room.share",
  "queue.join",
  "queue.cancel",
  "chat.send",
  "quick.send",
  "input.frame",
  "results.commit",
  "leaderboard.get",
  "friend.request",
  "friend.accept",
  "friend.block",
  "friend.report",
  "friend.list",
  "save.sync",
  "feedback.submit",
  "moderation.kick",
  "moderation.ban",
  "reconnect",
]);

const ALLOWED_PLAYLISTS = new Set(["casual", "ranked", "private", "bot"]);
const ALLOWED_CHAT_CHANNELS = new Set(["lobby", "friend"]);
const ALLOWED_FEEDBACK_TYPES = new Set(["bug", "feature", "fix", "other"]);
const PRIVATE_CODE_PATTERN = /^[A-Z0-9]{4,10}$/i;
const SAFE_ID_PATTERN = /^[a-z0-9_-]{1,32}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function onlyKeys(data, keys) {
  return Object.keys(data).every((key) => keys.has(key));
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isIntegerInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function isOptionalBoolean(data, key) {
  return !hasOwn(data, key) || typeof data[key] === "boolean";
}

function isOptionalString(data, key, maxLength) {
  return (
    !hasOwn(data, key) ||
    (typeof data[key] === "string" &&
      data[key].length > 0 &&
      data[key].length <= maxLength)
  );
}

function isOptionalFinite(data, key, min = -Infinity, max = Infinity) {
  return (
    !hasOwn(data, key) ||
    (isFiniteNumber(data[key]) && data[key] >= min && data[key] <= max)
  );
}

function encodedByteLength(value) {
  return new TextEncoder().encode(value).byteLength;
}

function rawToText(raw) {
  if (typeof raw === "string") return raw;
  if (raw instanceof ArrayBuffer) return new TextDecoder().decode(raw);
  if (ArrayBuffer.isView(raw)) {
    return new TextDecoder().decode(
      new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength),
    );
  }
  return String(raw ?? "");
}

function normalizeModerationText(value) {
  const leetMap = {
    0: "o",
    1: "i",
    3: "e",
    4: "a",
    5: "s",
    7: "t",
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

function isSevereModerationHit(value) {
  const normalized = normalizeModerationText(value);
  return SEVERE_MODERATION_PATTERNS.some((pattern) => pattern.test(normalized));
}

function validateRoomOptions(data) {
  const keys = new Set([
    "type",
    "mode",
    "playlist",
    "size",
    "teamSize",
    "ranked",
    "botFill",
    "private",
    "devMode",
  ]);
  if (!onlyKeys(data, keys)) return "invalid_protocol";
  if (
    !isOptionalString(data, "mode", 32) ||
    !isOptionalString(data, "playlist", 32) ||
    !isOptionalBoolean(data, "ranked") ||
    !isOptionalBoolean(data, "botFill") ||
    !isOptionalBoolean(data, "private") ||
    !isOptionalBoolean(data, "devMode")
  ) {
    return "invalid_protocol";
  }
  if (hasOwn(data, "mode") && !SAFE_ID_PATTERN.test(data.mode)) {
    return "invalid_protocol";
  }
  if (hasOwn(data, "playlist") && !ALLOWED_PLAYLISTS.has(data.playlist)) {
    return "invalid_protocol";
  }
  if (hasOwn(data, "size") && ![2, 4, 6].includes(Number(data.size))) {
    return "invalid_protocol";
  }
  if (hasOwn(data, "teamSize") && ![1, 2, 3].includes(Number(data.teamSize))) {
    return "invalid_protocol";
  }
  if (data.type === "queue.join" && data.ranked && data.devMode) {
    return "ranked_dev_rejected";
  }
  return "";
}

function validateInputFrame(data) {
  const keys = new Set([
    "type",
    "tick",
    "seq",
    "dt",
    "mode",
    "x",
    "z",
    "speed",
    "throttle",
    "steer",
    "drift",
    "boost",
    "jump",
    "client",
  ]);
  const authoritativeKeys = [
    "admin",
    "coins",
    "devWin",
    "goal",
    "rank",
    "rating",
    "score",
    "unlock",
    "win",
  ];
  if (authoritativeKeys.some((key) => hasOwn(data, key))) {
    return "authoritative_rejected";
  }
  if (!onlyKeys(data, keys)) return "invalid_protocol";
  if (hasOwn(data, "client")) {
    if (!isPlainObject(data.client)) return "invalid_protocol";
    if (!onlyKeys(data.client, new Set(["x", "z", "speed"]))) {
      return "invalid_protocol";
    }
    if (
      !isOptionalFinite(data.client, "x", -1000, 1000) ||
      !isOptionalFinite(data.client, "z", -1000, 1000) ||
      !isOptionalFinite(data.client, "speed", -420, 420)
    ) {
      return hasOwn(data.client, "speed")
        ? "speed_rejected"
        : "invalid_protocol";
    }
  }
  if (hasOwn(data, "speed")) {
    if (!isFiniteNumber(data.speed) || Math.abs(data.speed) > 420) {
      return "speed_rejected";
    }
  }
  if (
    !isOptionalFinite(data, "x", -1000, 1000) ||
    !isOptionalFinite(data, "z", -1000, 1000) ||
    !isOptionalFinite(data, "dt", 0, 0.12) ||
    !isOptionalFinite(data, "throttle", -1, 1) ||
    !isOptionalFinite(data, "steer", -1, 1) ||
    !isOptionalString(data, "mode", 32)
  ) {
    return "invalid_protocol";
  }
  if (hasOwn(data, "mode") && !SAFE_ID_PATTERN.test(data.mode)) {
    return "invalid_protocol";
  }
  if (hasOwn(data, "tick") && !isIntegerInRange(Number(data.tick), 0, 1e9)) {
    return "invalid_protocol";
  }
  if (hasOwn(data, "seq") && !isIntegerInRange(data.seq, 0, 1e9)) {
    return "invalid_protocol";
  }
  for (const key of ["drift", "jump"]) {
    if (hasOwn(data, key) && typeof data[key] !== "boolean") {
      return "invalid_protocol";
    }
  }
  if (hasOwn(data, "boost")) {
    const validBoost =
      typeof data.boost === "boolean" ||
      (isFiniteNumber(data.boost) && data.boost >= 0 && data.boost <= 1);
    if (!validBoost) return "invalid_protocol";
  }
  return "";
}

function validateSafePayload(data, maxKeys = 80) {
  if (!isPlainObject(data)) return false;
  const keys = Object.keys(data);
  if (keys.length > maxKeys) return false;
  try {
    return encodedByteLength(JSON.stringify(data)) <= 20000;
  } catch {
    return false;
  }
}

export function sanitizeChat(input) {
  const raw = String(input ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
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

export function normalizeUsername(input, fallback = "") {
  const sanitized = sanitizeChat(input).replace(/[^a-z0-9 _-]/gi, "");
  if (!sanitized || sanitized === "[blocked]") return fallback;
  return sanitized.slice(0, 24);
}

export function canUseFreeChat(age) {
  return Number.isInteger(age) && age >= 13;
}

export function validateClientMessage(raw) {
  let text;
  try {
    text = rawToText(raw);
  } catch {
    return { ok: false, error: "invalid_shape" };
  }
  if (encodedByteLength(text) > MESSAGE_LIMIT_BYTES) {
    return { ok: false, error: "message_too_large" };
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "invalid_json" };
  }
  if (!isPlainObject(data) || typeof data.type !== "string") {
    return { ok: false, error: "invalid_shape" };
  }
  if (!ALLOWED_TYPES.has(data.type)) {
    return { ok: false, error: "unknown_type" };
  }

  let error = "";
  if (data.type === "ping") {
    const keys = new Set(["type", "at", "t"]);
    if (
      !onlyKeys(data, keys) ||
      !isOptionalFinite(data, "at", 0) ||
      !isOptionalFinite(data, "t", 0)
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "auth.guest") {
    const keys = new Set([
      "type",
      "version",
      "username",
      "age",
      "deviceId",
      "sessionToken",
    ]);
    if (
      !onlyKeys(data, keys) ||
      (data.version !== undefined && data.version !== PROTOCOL_VERSION) ||
      typeof data.username !== "string" ||
      data.username.trim().length < 1 ||
      data.username.length > 24 ||
      (hasOwn(data, "age") && !isIntegerInRange(Number(data.age), 0, 120)) ||
      (hasOwn(data, "deviceId") &&
        (typeof data.deviceId !== "string" || data.deviceId.length > 96)) ||
      (hasOwn(data, "sessionToken") &&
        (typeof data.sessionToken !== "string" ||
          data.sessionToken.length > 128))
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "auth.account") {
    const keys = new Set([
      "type",
      "version",
      "mode",
      "username",
      "password",
      "age",
      "deviceId",
      "sessionToken",
      "turnstileToken",
    ]);
    const mode = data.mode ?? "auto";
    if (
      !onlyKeys(data, keys) ||
      (data.version !== undefined && data.version !== PROTOCOL_VERSION) ||
      !["auto", "create", "signin"].includes(mode) ||
      typeof data.username !== "string" ||
      data.username.trim().length < 2 ||
      data.username.length > 24 ||
      typeof data.password !== "string" ||
      data.password.length < 6 ||
      data.password.length > 128 ||
      !isIntegerInRange(Number(data.age), 0, 120) ||
      (hasOwn(data, "deviceId") &&
        (typeof data.deviceId !== "string" || data.deviceId.length > 96)) ||
      (hasOwn(data, "sessionToken") &&
        (typeof data.sessionToken !== "string" ||
          data.sessionToken.length > 128)) ||
      (hasOwn(data, "turnstileToken") &&
        (typeof data.turnstileToken !== "string" ||
          data.turnstileToken.length > 2048))
    ) {
      error = "invalid_protocol";
    } else {
      data.mode = mode;
    }
  }
  if (data.type === "profile.claimUsername") {
    const keys = new Set(["type", "username", "turnstileToken"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.username !== "string" ||
      data.username.trim().length < 1 ||
      data.username.length > 24 ||
      (hasOwn(data, "turnstileToken") &&
        (typeof data.turnstileToken !== "string" ||
          data.turnstileToken.length > 2048))
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "profile.get" || data.type === "profile.logout") {
    if (!onlyKeys(data, new Set(["type"]))) error = "invalid_protocol";
  }
  if (data.type === "profile.delete") {
    const keys = new Set(["type", "confirmUsername"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.confirmUsername !== "string" ||
      data.confirmUsername.trim().length < 1 ||
      data.confirmUsername.length > 24
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "room.create" || data.type === "queue.join") {
    error = validateRoomOptions(data);
  }
  if (data.type === "room.join") {
    const keys = new Set(["type", "code", "botFill"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.code !== "string" ||
      !PRIVATE_CODE_PATTERN.test(data.code) ||
      !isOptionalBoolean(data, "botFill")
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "room.share") {
    if (!onlyKeys(data, new Set(["type"]))) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "room.leave" || data.type === "queue.cancel") {
    if (!onlyKeys(data, new Set(["type"]))) error = "invalid_protocol";
  }
  if (data.type === "chat.send") {
    const keys = new Set(["type", "text", "age", "channel"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.text !== "string" ||
      data.text.trim().length < 1 ||
      data.text.length > 160 ||
      (hasOwn(data, "channel") && !ALLOWED_CHAT_CHANNELS.has(data.channel)) ||
      (hasOwn(data, "age") && !isIntegerInRange(Number(data.age), 0, 120))
    ) {
      error = "invalid_protocol";
    } else if (hasOwn(data, "age") && !canUseFreeChat(Number(data.age))) {
      error = "chat_requires_13_plus";
    }
  }
  if (data.type === "quick.send") {
    const keys = new Set(["type", "text"]);
    if (!onlyKeys(data, keys) || !QUICK_CHAT.has(data.text)) {
      error = "invalid_quick_chat";
    }
  }
  if (data.type === "input.frame") {
    error = validateInputFrame(data);
  }
  if (data.type === "results.commit") {
    error = "authoritative_rejected";
  }
  if (data.type === "leaderboard.get") {
    const keys = new Set(["type", "playlist"]);
    if (
      !onlyKeys(data, keys) ||
      (hasOwn(data, "playlist") && !ALLOWED_PLAYLISTS.has(data.playlist))
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "friend.request") {
    const keys = new Set(["type", "username"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.username !== "string" ||
      data.username.trim().length < 1 ||
      data.username.length > 24
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "friend.accept") {
    const keys = new Set(["type", "requestId"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.requestId !== "string" ||
      data.requestId.length < 1 ||
      data.requestId.length > 80
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "friend.block") {
    const keys = new Set(["type", "username"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.username !== "string" ||
      data.username.trim().length < 1 ||
      data.username.length > 24
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "friend.report") {
    const keys = new Set(["type", "username", "reason"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.username !== "string" ||
      data.username.trim().length < 1 ||
      data.username.length > 24 ||
      typeof data.reason !== "string" ||
      data.reason.trim().length < 3 ||
      data.reason.length > 180
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "friend.list") {
    if (!onlyKeys(data, new Set(["type"]))) error = "invalid_protocol";
  }
  if (data.type === "save.sync") {
    const keys = new Set(["type", "schemaVersion", "payload"]);
    if (
      !onlyKeys(data, keys) ||
      !isIntegerInRange(Number(data.schemaVersion), 1, 20) ||
      !validateSafePayload(data.payload, 80)
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "feedback.submit") {
    const keys = new Set([
      "type",
      "feedbackType",
      "message",
      "replyEmail",
      "diagnostics",
      "turnstileToken",
    ]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.feedbackType !== "string" ||
      !ALLOWED_FEEDBACK_TYPES.has(data.feedbackType) ||
      typeof data.message !== "string" ||
      data.message.trim().length < 8 ||
      data.message.length > 2000 ||
      (hasOwn(data, "replyEmail") &&
        data.replyEmail !== "" &&
        (typeof data.replyEmail !== "string" ||
          data.replyEmail.length > 120 ||
          !EMAIL_PATTERN.test(data.replyEmail))) ||
      (hasOwn(data, "diagnostics") &&
        !validateSafePayload(data.diagnostics, 50)) ||
      (hasOwn(data, "turnstileToken") &&
        (typeof data.turnstileToken !== "string" ||
          data.turnstileToken.length > 2048))
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "moderation.kick" || data.type === "moderation.ban") {
    const keys = new Set(["type", "username", "userId", "reason"]);
    const hasTarget =
      (typeof data.username === "string" &&
        data.username.trim().length >= 1 &&
        data.username.length <= 24) ||
      (typeof data.userId === "string" &&
        data.userId.trim().length >= 1 &&
        data.userId.length <= 80);
    if (
      !onlyKeys(data, keys) ||
      !hasTarget ||
      (hasOwn(data, "reason") &&
        (typeof data.reason !== "string" ||
          data.reason.trim().length < 1 ||
          data.reason.length > 180))
    ) {
      error = "invalid_protocol";
    }
  }
  if (data.type === "reconnect") {
    const keys = new Set(["type", "sessionToken", "roomCode"]);
    if (
      !onlyKeys(data, keys) ||
      typeof data.sessionToken !== "string" ||
      data.sessionToken.length < 8 ||
      data.sessionToken.length > 128 ||
      (hasOwn(data, "roomCode") &&
        (typeof data.roomCode !== "string" ||
          !PRIVATE_CODE_PATTERN.test(data.roomCode)))
    ) {
      error = "invalid_protocol";
    }
  }
  if (error) return { ok: false, error };
  return { ok: true, data };
}

export function makePrivateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomValues = new Uint32Array(6);
  globalThis.crypto.getRandomValues(randomValues);
  return [...randomValues]
    .map((value) => alphabet[value % alphabet.length])
    .join("");
}

export function normalizeRoomOptions(data = {}) {
  const playlist = data.playlist || (data.ranked ? "ranked" : "casual");
  const mode = data.mode || playlist;
  const ranked = Boolean(data.ranked) || playlist === "ranked";
  const teamSize = [1, 2, 3].includes(Number(data.teamSize))
    ? Number(data.teamSize)
    : [2, 4, 6].includes(Number(data.size))
      ? Number(data.size) / 2
      : ranked
        ? 1
        : 3;
  return {
    mode,
    playlist,
    size: teamSize * 2,
    teamSize,
    ranked,
    botFill: data.botFill !== false,
    private: data.private !== false && data.type === "room.create",
  };
}
