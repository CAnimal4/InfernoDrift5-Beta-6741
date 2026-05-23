export const FIREBASE_USERNAME_PATTERN =
  /^(?!.* {2})[A-Za-z0-9][A-Za-z0-9 _-]{1,18}[A-Za-z0-9]$/;
export const FIREBASE_CHAT_LIMIT = 300;
export const FIREBASE_FEEDBACK_LIMIT = 2500;
export const FIREBASE_SCORE_LIMIT = 1_000_000;
export const FIREBASE_LEADERBOARD_MODE = "all-modes";
export const FIREBASE_BACKEND_MODE = "firebase";
export const FIREBASE_LOBBY_CODE_PATTERN = /^[A-Z0-9]{4,8}$/;
const FIREBASE_LOBBY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const FIREBASE_SYSTEM_USERNAME_KEYS = new Set(["chatgptcodex"]);

const BLOCKED_TERMS = [
  /(?:n|ñ|m)[\W_]*[i1!l|][\W_]*g[\W_]*g[\W_]*(?:e|3)[\W_]*r/i,
  /f[\W_]*[a4@][\W_]*g[\W_]*g?[\W_]*(?:o|0)[\W_]*t/i,
  /f[\W_]*(?:u[\W_]*)?c[\W_]*k/i,
  /h[\W_]*[i1!l|][\W_]*t[\W_]*l[\W_]*(?:e|3)[\W_]*r/i,
  /white[\W_]*power/i,
  /kill[\W_]*(?:yourself|urself|your\s*self)/i,
  /go[\W_]*(?:die|hurt yourself|hurt urself)/i,
  /(?:you|u)[\W_]*(?:are|r)[\W_]*(?:trash|garbage|worthless|a loser)/i,
  /no[\W_]*one[\W_]*likes[\W_]*(?:you|u)/i,
  /\b(?:sex|porn|nude|nudes|horny)\b/i,
  /s[\W_]*(?:e|3)[\W_]*x/i,
  /p[\W_]*(?:o|0)[\W_]*r[\W_]*n/i,
  /n[\W_]*u[\W_]*d[\W_]*(?:e|3)[\W_]*s?/i,
  /\b(?:password|address|phone number|where do you live)\b/i,
  /\b(?:admin|moderator|mod)\b/i,
];

const MILD_REPLACEMENTS = new Map([
  ["shit", "boost"],
  ["damn", "dang"],
  ["hell", "heck"],
  ["crap", "scrap"],
]);

const FIREBASE_CREDENTIAL_BADGES = [
  {
    username: "Tosh_the_Sigma",
    password: "iamthesigma",
    badge: "Rizzler",
  },
  {
    username: "Joshua",
    password: "footballcards",
    badge: "Advanced Player",
  },
  {
    username: "MODERATOR",
    password: "thefoxjumpedoverthelazyriver",
    badge: "MOD",
  },
];

function deobfuscate(value = "") {
  return String(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[4@]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^\w\s-]/g, " ")
    .replace(/([a-z])\1{2,}/g, "$1$1")
    .replace(/\s+/g, " ")
    .trim();
}

function moderationVariants(value = "") {
  const normalized = deobfuscate(value);
  const compact = normalized.replace(/[\W_]+/g, "");
  const squashed = compact.replace(/([a-z])\1+/g, "$1");
  return [normalized, compact, squashed].filter(Boolean);
}

function hasBlockedContent(value = "") {
  return moderationVariants(value).some((variant) =>
    BLOCKED_TERMS.some((pattern) => pattern.test(variant)),
  );
}

export function normalizeFirebaseUsername(value = "") {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function normalizeFirebaseUsernameKey(value = "") {
  return normalizeFirebaseUsername(value).toLowerCase();
}

function normalizeFirebaseSystemUsernameKey(value = "") {
  return normalizeFirebaseUsername(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function validateFirebaseUsername(value = "") {
  const username = normalizeFirebaseUsername(value);
  const lower = username.toLowerCase();
  if (FIREBASE_SYSTEM_USERNAME_KEYS.has(normalizeFirebaseSystemUsernameKey(username))) {
    return {
      ok: false,
      error: "username_reserved",
      username,
      usernameLower: lower,
    };
  }
  if (!FIREBASE_USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "username_invalid",
      username,
      usernameLower: lower,
    };
  }
  if (hasBlockedContent(username)) {
    return {
      ok: false,
      error: "username_rejected",
      username,
      usernameLower: lower,
    };
  }
  return { ok: true, username, usernameLower: lower };
}

function hasFirebaseCredentialAccess(username = "", password = "") {
  const cleanUsername = normalizeFirebaseUsername(username);
  const rawPassword = String(password || "");
  return FIREBASE_CREDENTIAL_BADGES.some(
    (entry) =>
      cleanUsername === entry.username && rawPassword === entry.password,
  );
}

function isFirebaseCredentialUsername(username = "") {
  const cleanUsername = normalizeFirebaseUsername(username);
  return FIREBASE_CREDENTIAL_BADGES.some(
    (entry) => cleanUsername === entry.username,
  );
}

export function validateFirebaseAccountCredentials(
  value = "",
  password = "",
) {
  const validation = validateFirebaseUsername(value);
  if (validation.ok) return validation;
  const username = normalizeFirebaseUsername(value);
  const lower = username.toLowerCase();
  if (
    validation.error === "username_rejected" &&
    FIREBASE_USERNAME_PATTERN.test(username) &&
    hasFirebaseCredentialAccess(username, password) &&
    !FIREBASE_SYSTEM_USERNAME_KEYS.has(
      normalizeFirebaseSystemUsernameKey(username),
    )
  ) {
    return {
      ok: true,
      username,
      usernameLower: lower,
      credentialOverride: true,
    };
  }
  if (
    validation.error === "username_rejected" &&
    isFirebaseCredentialUsername(username)
  ) {
    return {
      ok: false,
      error: "invalid_credentials",
      username,
      usernameLower: lower,
    };
  }
  return validation;
}

export function usernameToFirebaseEmail(username = "") {
  const validation = validateFirebaseUsername(username);
  if (!validation.ok) throw new Error(validation.error);
  const emailKey = validation.usernameLower
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "-");
  return `id4.${emailKey}@infernodrift4.firebaseapp.com`;
}

export function getFirebaseBadges(username = "") {
  if (username === "Clark") return ["Founder"];
  if (username === "JFine") return ["Advanced Player"];
  return [];
}

export function getFirebaseCredentialBadges(username = "", password = "") {
  const badges = getFirebaseBadges(username);
  const cleanUsername = String(username || "").trim();
  const rawPassword = String(password || "");
  for (const entry of FIREBASE_CREDENTIAL_BADGES) {
    if (cleanUsername === entry.username && rawPassword === entry.password) {
      return badges.includes(entry.badge) ? badges : [...badges, entry.badge];
    }
  }
  return badges;
}

export function sanitizeFirebaseText(value = "", limit = FIREBASE_CHAT_LIMIT) {
  let text = String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
  if (!text) return { ok: false, error: "empty_text", text: "" };
  if (hasBlockedContent(text)) {
    return { ok: false, error: "text_rejected", text: "" };
  }
  for (const [bad, replacement] of MILD_REPLACEMENTS) {
    text = text.replace(new RegExp(`\\b${bad}\\b`, "gi"), replacement);
  }
  return { ok: true, text };
}

export function validateFirebaseScore(row = {}) {
  const rawScore = row.score ?? row.xp ?? row.totalXp;
  const numericScore = Number(rawScore);
  const score = Math.floor(numericScore);
  const mode = String(row.mode || FIREBASE_LEADERBOARD_MODE)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 40);
  if (
    rawScore === undefined ||
    !Number.isFinite(numericScore) ||
    score < 0 ||
    score > FIREBASE_SCORE_LIMIT
  ) {
    return { ok: false, error: "score_rejected", score, mode };
  }
  return { ok: true, score, mode: mode || FIREBASE_LEADERBOARD_MODE };
}

export function validateFirebaseFeedback(message = "") {
  const text = String(message || "").trim();
  if (!text) return { ok: false, error: "empty_feedback" };
  if (text.length > FIREBASE_FEEDBACK_LIMIT) {
    return { ok: false, error: "feedback_too_long" };
  }
  const clean = sanitizeFirebaseText(text, FIREBASE_FEEDBACK_LIMIT);
  if (!clean.ok) return { ok: false, error: "feedback_rejected" };
  return { ok: true, text: clean.text };
}

export function normalizeFirebaseLobbyCode(value = "") {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

export function validateFirebaseLobbyCode(value = "") {
  const code = normalizeFirebaseLobbyCode(value);
  if (!FIREBASE_LOBBY_CODE_PATTERN.test(code)) {
    return { ok: false, error: "room_not_found", code };
  }
  return { ok: true, code };
}

export function createFirebaseLobbyCode({
  random = globalThis.crypto,
  length = 5,
} = {}) {
  const size = Math.max(4, Math.min(8, Math.floor(Number(length) || 5)));
  const bytes = new Uint8Array(size);
  if (random?.getRandomValues) random.getRandomValues(bytes);
  else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => {
    return FIREBASE_LOBBY_CODE_ALPHABET[
      byte % FIREBASE_LOBBY_CODE_ALPHABET.length
    ];
  }).join("");
}

export function mapFirebaseError(error) {
  const code = String(
    error?.code || error?.message || error || "firebase_error",
  )
    .replace(/^Firebase:\s*/i, "")
    .replace(/[()]/g, "")
    .toLowerCase();
  if (code.includes("network") || code.includes("unavailable")) {
    return "firebase_unavailable";
  }
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "invalid_credentials";
  }
  if (code.includes("email-already-in-use")) return "username_taken";
  if (code.includes("user-not-found")) return "account_not_found";
  if (code.includes("weak-password")) return "weak_password";
  if (code.includes("permission-denied")) return "permission_denied";
  if (code.includes("username_taken")) return "username_taken";
  return code.replace(/[^a-z0-9_ -]/g, "").replace(/\s+/g, "_");
}
